/**
 * Utilidad genérica para validar transiciones de estado (State Machine)
 */

export type TransitionResult = { canTransition: boolean; reason?: string };

/**
 * Crea un validador de transiciones de estado reutilizable.
 *
 * @template S - Tipo de los estados (generalmente un enum o unión de strings)
 * @param params - Configuración del validador
 * @param params.allowed - Mapa de estados origen a estados destino permitidos
 * @param params.labels - Etiquetas legibles para cada estado
 * @param params.terminal - Estados terminales desde los que no se puede transicionar
 * @param params.sameStateReason - Mensaje cuando el estado no cambia
 * @param params.forbiddenReasonBuilder - Constructor de mensaje para transiciones no permitidas
 * @param params.terminalReasonBuilder - Constructor de mensaje para transiciones desde estados terminales
 * @returns Función validadora que recibe (estadoDestino, estadoOrigen) y retorna TransitionResult
 *
 * @example
 * ```typescript
 * import { makeTransitionValidator, TransitionResult } from '@domain/utils/state-machine.util';
 * import { QuoteStatus } from '../../sale-quote/quote-status.enum';
 *
 * export function handleRentQuoteStatusTransition(
 *   newStatus: QuoteStatus,
 *   previousStatus: QuoteStatus
 * ): TransitionResult {
 *   type Status = QuoteStatus;
 *
 *   const labels: Record<Status, string> = {
 *     PENDING: 'Pendiente',
 *     APPROVED: 'Aprobada',
 *     REJECTED: 'Rechazada',
 *     CANCELED: 'Cancelada',
 *     SOLD: 'Rentada',
 *   } as const;
 *
 *   const allowed: Record<Status, readonly Status[]> = {
 *     [QuoteStatus.PENDING]: [QuoteStatus.APPROVED, QuoteStatus.REJECTED, QuoteStatus.CANCELED],
 *     [QuoteStatus.APPROVED]: [QuoteStatus.SOLD, QuoteStatus.CANCELED],
 *     [QuoteStatus.REJECTED]: [QuoteStatus.PENDING, QuoteStatus.CANCELED],
 *     [QuoteStatus.CANCELED]: [],
 *     [QuoteStatus.SOLD]: [],
 *   } as const;
 *
 *   const validator = makeTransitionValidator<Status>({
 *     allowed,
 *     labels,
 *     terminal: [QuoteStatus.CANCELED, QuoteStatus.SOLD],
 *     terminalReasonBuilder: (from, to, dict) => {
 *       if (from === QuoteStatus.SOLD) {
 *         return `No se puede transicionar desde ${dict[from]}. La cotización ya fue convertida en renta.`;
 *       }
 *       if (from === QuoteStatus.CANCELED) {
 *         return `No se puede transicionar desde ${dict[from]}. La cotización está cancelada permanentemente.`;
 *       }
 *       return `No se puede transicionar desde ${dict[from]} hacia ${dict[to]}. Es un estado terminal.`;
 *     },
 *     forbiddenReasonBuilder: (from, to, dict) => {
 *       if (from === QuoteStatus.APPROVED && to !== QuoteStatus.SOLD && to !== QuoteStatus.CANCELED) {
 *         return `Una cotización ${dict[from]} solo puede ser rentada o cancelada.`;
 *       }
 *       return `Transición no permitida desde ${dict[from]} hacia ${dict[to]}.`;
 *     },
 *   });
 *
 *   return validator(newStatus, previousStatus);
 * }
 * ```
 */
export function makeTransitionValidator<S extends string>(params: {
    allowed: Record<S, readonly S[]>;
    labels: Record<S, string>;
    terminal?: readonly S[];
    sameStateReason?: string;
    forbiddenReasonBuilder?: (from: S, to: S, labels: Record<S, string>) => string;
    terminalReasonBuilder?: (from: S, to: S, labels: Record<S, string>) => string;
}) {
    const terminalSet = new Set(params.terminal ?? []);

    const defaultForbidden = (from: S, to: S, labels: Record<S, string>) =>
        `Transición no permitida desde ${labels[from]} hacia ${labels[to]}.`;
    const defaultTerminal = (from: S, to: S, labels: Record<S, string>) =>
        `No se puede transicionar desde ${labels[from]} hacia ${labels[to]}. Es un estado terminal.`;

    return (to: S, from: S): TransitionResult => {
        if (to === from) {
            return { canTransition: true, reason: params.sameStateReason ?? 'No hay cambios de estado.' };
        }

        if (terminalSet.has(from)) {
            return {
                canTransition: false,
                reason: (params.terminalReasonBuilder ?? defaultTerminal)(from, to, params.labels),
            };
        }

        const allowed = new Set(params.allowed[from] ?? []);
        if (allowed.has(to)) return { canTransition: true };

        return {
            canTransition: false,
            reason: (params.forbiddenReasonBuilder ?? defaultForbidden)(from, to, params.labels),
        };
    };
}
