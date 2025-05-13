
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Creates a formatted description from car specifications and tags
 */
export function formatCarDescription(
  specifications: Record<string, string> = {}, 
  features: Record<string, string[]> = {},
  tags: string[] = []
): string {
  let description = '';
  
  // Add specifications section
  if (Object.keys(specifications).length > 0) {
    description += 'This vehicle comes with the following specifications:\n\n';
    Object.entries(specifications).forEach(([key, value]) => {
      description += `- ${key}: ${value}\n`;
    });
    description += '\n';
  }
  
  // Add feature highlights
  if (Object.values(features).some(arr => arr.length > 0)) {
    description += 'Key features include:\n';
    
    // Get a limited number of features from each category
    let featuresAdded = 0;
    const MAX_FEATURES = 15;
    
    for (const [category, featureList] of Object.entries(features)) {
      if (featureList.length === 0) continue;
      
      // Add category header for better organization
      description += `\n${category}:\n`;
      
      // Add up to 3 features per category, limiting to MAX_FEATURES total
      for (let i = 0; i < Math.min(3, featureList.length); i++) {
        if (featuresAdded >= MAX_FEATURES) break;
        description += `- ${featureList[i]}\n`;
        featuresAdded++;
      }
    }
    
    description += '\n';
  }
  
  // Add tags section
  if (tags && tags.length > 0) {
    description += 'This car is perfect for those looking for a ';
    description += tags.join(', ').toLowerCase();
    description += ' driving experience.';
  }
  
  return description;
}
