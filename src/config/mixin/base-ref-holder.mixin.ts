// Mixin para guardar referencia al objeto original/base
/** biome-ignore-all lint/suspicious/noExplicitAny: for mixin configuration */

import { GConstructor } from './base.mixin';

export class BaseRefHolder<T = any> {
    private _baseRef: T;

    constructor() {
        // Guarda la referencia a la instancia final
        this._baseRef = this as unknown as T;
    }

    /**
     * Devuelve la referencia al objeto original/base
     */
    getBaseRef(): T {
        return this._baseRef;
    }
}

// Convierte BaseRefHolder en un mixin funcional para poder usarlo como mixin por defecto
export function BaseRefHolderMixin<TBase extends GConstructor>(Base: TBase) {
    return class extends Base {
        // Debe ser public para evitar error de TS
        // _baseRef: InstanceType<TBase>;
        constructor(...args: any[]) {
            super(...args);
            // this._baseRef = this as InstanceType<TBase>;
        }
        getBaseRef(): InstanceType<TBase> {
            //return this as InstanceType<TBase>;
            return this.cleanupMethods(this);
        }
        cleanupMethods(baseClass: typeof this): InstanceType<TBase> {
            return {
                ...Object.entries(baseClass).reduce(
                    (acc, [key, value]) => {
                        if (typeof value !== 'function' && key !== 'domainEvents' && key !== 'transactionalEvents') {
                            acc[key] = value;
                        }
                        return acc;
                    },
                    {} as InstanceType<TBase>,
                ),
            };
        }
    };
}

// Ejemplo de uso:
// import { ManyMixinG } from './base.mixin';
// import { BaseRefHolder } from './common.mixins';
//
// class Selling extends BusinessTransaction { ... }
// const MixedSelling = ManyMixinG(Selling, BaseRefHolder);
// const obj = new MixedSelling({ ... });
// const base = obj.getBaseRef(); // base es la instancia original con todas las propiedades
