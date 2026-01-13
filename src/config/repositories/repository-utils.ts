import { DeactivationStrategy } from '@config/interfaces/base.interface.repository';

export const isAbleToSkipRestrictionsBecauseSoftDelete = ({
    softDeleteSkippedRestrictions,
    strategy,
}: {
    softDeleteSkippedRestrictions?: string[];
    strategy: DeactivationStrategy;
}) => {
    return softDeleteSkippedRestrictions && softDeleteSkippedRestrictions.length > 0 && strategy === 'soft';
};
