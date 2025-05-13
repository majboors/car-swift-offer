/**
 * Standard car feature categories
 */
export const STANDARD_CATEGORIES = [
  "Audio, Visual & Communication",
  "Comfort & Convenience",
  "Factory fitted",
  "Lights & Windows",
  "Safety & Security",
  "Seating",
  "Interior",
];

/**
 * Auto-segments raw feature data into standard categories
 * Cleans up prefixed items and categorizes them correctly
 * @param rawFeatures - Raw features object from API
 * @returns Properly categorized features
 */
export function processCarFeatures(rawFeatures: any): Record<string, string[]> {
  // If input is null, undefined, or empty, return an empty object
  if (!rawFeatures) return {};
  
  console.log("Processing raw features:", rawFeatures);

  // Start with an empty array for each standard category
  const output = STANDARD_CATEGORIES.reduce((acc: Record<string, string[]>, cat) => {
    acc[cat] = [];
    return acc;
  }, {});

  try {
    // Parse JSON string if needed
    let featuresObj = rawFeatures;
    
    if (typeof rawFeatures === 'string') {
      try {
        featuresObj = JSON.parse(rawFeatures);
        console.log("Successfully parsed features from JSON string");
      } catch (parseError) {
        console.error("Failed to parse features string:", parseError);
        // Keep original since parse failed
        featuresObj = rawFeatures;
      }
    }
    
    // If features is already a flat array, distribute to "Factory fitted" category
    if (Array.isArray(featuresObj)) {
      output["Factory fitted"] = featuresObj.filter(item => !!item && item.trim().length > 0);
      return output;
    }
    
    // Process each category in the features object
    Object.entries(featuresObj).forEach(([key, featuresList]) => {
      // Skip if not an array or empty
      if (!featuresList) return;
      
      // Convert to array if it's a string
      const features = Array.isArray(featuresList) ? featuresList : [featuresList];
      
      // Process each feature item
      features.forEach(originalItem => {
        // Skip empty items
        if (!originalItem || typeof originalItem !== 'string' || originalItem.trim() === '') return;
        
        let item = originalItem.trim();
        let targetCategory = STANDARD_CATEGORIES.includes(key) ? key : null;
        
        // Check if item starts with a category prefix (e.g., "Safety & Security:")
        for (const category of STANDARD_CATEGORIES) {
          if (item.startsWith(`${category}:`)) {
            targetCategory = category;
            item = item.substring(category.length + 1).trim();
            break;
          }
        }
        
        // If we still don't have a category, use Interior as default
        if (!targetCategory) {
          targetCategory = "Interior";
        }
        
        // Add item to appropriate category if it has content
        if (item && item.length > 0) {
          // Remove any trailing colons
          item = item.endsWith(':') ? item.slice(0, -1).trim() : item;
          // Only add non-empty items that aren't just a category name
          if (item.length > 0 && !STANDARD_CATEGORIES.includes(item)) {
            output[targetCategory].push(item);
          }
        }
      });
    });

    // Remove duplicates from each category
    Object.keys(output).forEach(category => {
      output[category] = [...new Set(output[category])];
    });
    
    console.log("Processed features:", output);
    return output;
    
  } catch (error) {
    console.error("Error processing features:", error);
    return STANDARD_CATEGORIES.reduce((acc: Record<string, string[]>, cat) => {
      acc[cat] = [];
      return acc;
    }, {});
  }
}
