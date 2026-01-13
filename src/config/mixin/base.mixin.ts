/** biome-ignore-all lint/suspicious/noExplicitAny: necessary for generic purposes */
import { BaseRefHolderMixin } from './base-ref-holder.mixin';

// Nuevo patrón: los mixins son funciones que extienden la clase base
/**
 * Tipo genérico para un constructor de clase.
 * @template T Tipo de la instancia creada por el constructor.
 */
export type GConstructor<T = {}> = new (...args: any[]) => T;
/**
 * Tipo para una función mixin que extiende una clase base y retorna una nueva clase.
 * @template TBase Clase base a extender.
 * @template TReturn Clase resultante del mixin.
 */
export type Mixin<TBase extends GConstructor, TReturn extends GConstructor = GConstructor> = (Base: TBase) => TReturn;

// Aplica un solo mixin funcional
/**
 * Aplica un mixin funcional a una clase base.
 * @param Base Clase base a extender.
 * @param MixinFn Función mixin a aplicar.
 * @returns Nueva clase extendida.
 */
export function MixinG<TBase extends GConstructor, TReturn extends GConstructor>(
    Base: TBase,
    MixinFn: Mixin<TBase, TReturn>,
): TReturn {
    return MixinFn(Base);
}

// Utilidad para obtener la instancia de un mixin aplicado sobre una base
/**
 * Utilidad para obtener la instancia de un mixin aplicado sobre una base.
 * @template TBase Clase base.
 * @template TMixin Mixin aplicado.
 */
type ApplyMixin<TBase, TMixin extends Mixin<GConstructor>> = TMixin extends Mixin<GConstructor, infer TReturn>
    ? InstanceType<TReturn>
    : TBase;

// Intersección recursiva de instancias de mixins
/**
 * Intersección recursiva de instancias de mixins.
 * @template TBase Clase base.
 * @template TMixins Mixins a aplicar.
 */
type ComposeMixins<TBase, TMixins extends Array<Mixin<GConstructor>>> = TMixins extends [infer TMixin, ...infer TRest]
    ? TMixin extends Mixin<GConstructor>
        ? ApplyMixin<TBase, TMixin> & ComposeMixins<TBase, Extract<TRest, Array<Mixin<GConstructor>>>>
        : TBase
    : TBase;

/**
 * Aplica por defecto los mixins AggregateRootMixin y BaseRefHolderMixin, junto con cualquier otro mixin adicional, sobre una clase base.
 * Retorna una clase que extiende la base y todos los mixins aplicados.
 * @template TBase Clase base a extender.
 * @template TMixins Mixins adicionales a aplicar.
 * @param Base Clase base.
 * @param Mixins Mixins adicionales.
 * @returns Nueva clase extendida con todos los mixins.
 */
export function ManyMixinG<TBase extends GConstructor, TMixins extends Array<Mixin<GConstructor>>>(
    Base: TBase,
    ...Mixins: TMixins
): new (
    ...args: ConstructorParameters<TBase>
) => ComposeMixins<InstanceType<TBase>, [typeof BaseRefHolderMixin, ...TMixins]> {
    return [BaseRefHolderMixin, ...Mixins].reduce((acc, mixin) => mixin(acc), Base) as any;
}
