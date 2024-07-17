// @ts-check
import { DiscountApplicationStrategy, RunInput } from "../generated/api";

// Use JSDoc annotations for type safety
/**
* @typedef {import("../generated/api").RunInput} RunInput
* @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
* @typedef {import("../generated/api").Target} Target
* @typedef {import("../generated/api").ProductVariant} ProductVariant
*/

/**
* @type {FunctionRunResult}
*/
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

// The configured entrypoint for the 'purchase.product-discount.run' extension target
/**
* @param {RunInput} input
* @returns {FunctionRunResult}
*/
export function run(input: RunInput) {
  const targets = input.cart.lines
  // Only include cart lines with a quantity of two or more
  .filter(line => line.quantity >= 2)
  .map(line => {
    // Check if the merchandise is of type ProductVariant
    if (line.merchandise.__typename === 'ProductVariant') {
      return {
        productVariant: {
          id: line.merchandise.id
        }
      };
    } else {
      return null;
    }
  })
  // Filter out any null values if handling differently
  .filter((target) => { return target !== null});

  if (!targets.length) {
    // You can use STDERR for debug logs in your function
    console.error("No cart lines qualify for volume discount.");
    return EMPTY_DISCOUNT;
  }

  // The @shopify/shopify_function package applies JSON.stringify() to your function result
  // and writes it to STDOUT
  return {
    discounts: [
      {
        // Apply the discount to the collected targets
        targets,
        // Define a percentage-based discount
        value: {
          percentage: {
            value: "10.0"
          }
        }
      }
    ],
    discountApplicationStrategy: DiscountApplicationStrategy.First
  };
};
