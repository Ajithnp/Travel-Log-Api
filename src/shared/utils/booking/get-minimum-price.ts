import { PricingTierDTO } from "../../../types/dtos/vendor/response.dtos";

export const getMinimumPrice = (pricing: PricingTierDTO[]) => {
    if(!pricing || pricing.length ==0){
        return 0;
    }
    return Math.min(...pricing.map((p: PricingTierDTO) => p.price));
}