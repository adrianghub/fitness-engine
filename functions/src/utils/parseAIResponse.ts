import * as logger from "firebase-functions/logger";

interface ParseConfig<T> {
  tag: string;
  key: keyof T;
  maxItems: number;
}

export function parseAIResponse<T extends Record<string, unknown>>(
  response: string,
  config: ParseConfig<T>
): string[] | null {
  try {
    // First, try to find the content between tags
    const tagPattern = new RegExp(`<${config.tag}>(.*?)</${config.tag}>`, "s");
    const match = response.match(tagPattern);

    if (!match || !match[1]) {
      logger.warn(`No content found between ${config.tag} tags`);
      return null;
    }

    // Clean up the content - remove markdown code blocks if present
    let jsonContent = match[1].trim();
    jsonContent = jsonContent.replace(/```json\n/g, ""); // Remove opening markdown
    jsonContent = jsonContent.replace(/\n```/g, ""); // Remove closing markdown
    jsonContent = jsonContent.trim();

    logger.debug(`Cleaned JSON content: ${jsonContent}`);

    // Try to parse the JSON content
    const parsed = JSON.parse(jsonContent) as T;

    // Validate the parsed content
    const key = String(config.key);
    const items = parsed[key];
    if (!Array.isArray(items)) {
      logger.warn(`${key} is not an array in parsed content`);
      return null;
    }

    // Return the items, limited to maxItems
    return items.slice(0, config.maxItems);
  } catch (error) {
    logger.error(`Error parsing ${config.tag} response:`, error);
    logger.error("Response content:", response);
    return null;
  }
}
