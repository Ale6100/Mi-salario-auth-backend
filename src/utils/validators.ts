// src\utils\validators.ts

import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isMinusOneOrPositive', async: false })
export class IsMinusOneOrPositiveConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'number' && (value === -1 || value >= 0);
  }

  defaultMessage(): string {
    return 'El valor debe ser -1 o mayor o igual a 0';
  }
}

export function IsMinusOneOrPositive(
  validationOptions?: ValidationOptions,
  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
): (object: Object, propertyName: string) => void {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMinusOneOrPositiveConstraint,
    });
  };
}
