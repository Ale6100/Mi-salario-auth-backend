import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConceptosIngresos } from '../conceptos_ingresos/schema/conceptos_ingresos.schema';
import { ConceptosGastos } from '../conceptos_gastos/schema/conceptos_gastos.schema';
import { FondoEmergencia } from '../fondo_emergencia/schema/fondo_emergencia.schema';

@Injectable()
export class CronService {
  constructor(
    @InjectModel(ConceptosIngresos.name)
    private readonly conceptosIngresosModel: Model<ConceptosIngresos>,
    @InjectModel(ConceptosGastos.name)
    private readonly conceptosGastosModel: Model<ConceptosGastos>,
    @InjectModel(FondoEmergencia.name)
    private readonly fondoEmergenciaModel: Model<FondoEmergencia>,
  ) {}

  async getInfoActual(sub: string) {
    const now = new Date();
    const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const currentDay = now.getDate();

    const ingresosDocs = await this.conceptosIngresosModel
      .find({ sub, periodo })
      .exec();
    const ingresos = ingresosDocs.reduce((sum, ing) => sum + ing.valor, 0);

    const gastosDocs = await this.conceptosGastosModel
      .find({ sub, periodo })
      .exec();

    let gastos = 0;
    for (const gasto of gastosDocs) {
      let montoCalculado = 0;

      if (gasto.monto !== undefined && gasto.monto !== -1) {
        montoCalculado = gasto.monto;
      } else if (
        gasto.porcentaje_total !== undefined &&
        gasto.porcentaje_total !== -1
      ) {
        montoCalculado = (gasto.porcentaje_total / 100) * ingresos;
      }

      gastos += montoCalculado;
    }

    const fondo = await this.fondoEmergenciaModel.findOne({ sub }).exec();

    const gastosPendientesDocs = await this.conceptosGastosModel
      .find({ sub, periodo, pagado: { $ne: true } })
      .populate('id_fuente_gasto')
      .exec();

    const gastosPendientes = gastosPendientesDocs.map((g) => {
      const gObj = g.toObject();
      const fuente = gObj.id_fuente_gasto as unknown as {
        nombre: string;
      };

      let montoCalculado = 0;
      if (gObj.monto !== undefined && gObj.monto !== -1) {
        montoCalculado = gObj.monto;
      } else if (
        gObj.porcentaje_total !== undefined &&
        gObj.porcentaje_total !== -1
      ) {
        montoCalculado = (gObj.porcentaje_total / 100) * ingresos;
      }

      return {
        nombre: fuente.nombre,
        monto: montoCalculado,
      };
    });

    const excedente = ingresos - gastos;
    const aporteAlFondoEmergencia =
      fondo?.porcentaje_total && fondo.porcentaje_total > 0
        ? (fondo.porcentaje_total / 100) * excedente
        : 0;

    const balanceDelMes = ingresos - gastos - aporteAlFondoEmergencia;
    const gastoDiario = daysInMonth > 0 ? balanceDelMes / daysInMonth : 0;
    const balanceAlDiaDeHoy = balanceDelMes - gastoDiario * currentDay;

    const round = (n: number) => Math.round(n * 100) / 100;

    return {
      gastoDiario: round(gastoDiario),
      balanceAlDiaDeHoy: round(balanceAlDiaDeHoy),
      gastosPendientes,
    };
  }
}
