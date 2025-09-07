export type Fact = { k: string; v: string };
export type ParsedAbout = { facts: Fact[]; paragraphs: string[] };

// Expanded fact labels
const FACT_LABELS = [
  "Age", "Birthdate", "Birthday", "Height", "Weight", "Blood type", 
  "Blood Type", "Affiliation", "Position", "Occupation", "Aliases", 
  "Nicknames", "Hometown", "Origin", "Devil fruit", "Devil Fruit",
  "Type", "Bounty", "Status", "Gender", "Race", "Species", "Hair Color",
  "Eye Color", "Voice Actor", "Seiyuu", "Rank", "Class", "Weapon",
  "Abilities", "Powers", "Relatives", "Family", "Likes", "Dislikes",
  "Birthplace", "Nationality", "Debut", "Zodiac", "Horoscope",
  "Known Relatives", "Theme Song"
];

// Regex for colon format: "Label: value"
const labelGroup = FACT_LABELS
  .map(l => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");
  
const COLON_FACT_RE = new RegExp(`(?:^|\\n)\\s*(${labelGroup})\\s*[:：]\\s*([^\\n.;]+)`, "gi");

// Regex for linebreak format: "Label\nvalue"
const LINEBREAK_FACT_RE = new RegExp(`(?:^|\\n)\\s*(${labelGroup})\\s*\\n\\s*([^\\n]+)`, "gi");

// Enhanced abbreviations
const ABBREV = [
  "Mr", "Mrs", "Ms", "Dr", "Prof", "St", "vs", "etc", "e\\.g", "i\\.e", 
  "U\\.S", "U\\.K", "Inc", "Ltd", "Corp", "Vol", "Ch", "Ep", "No", "vs",
  "approx", "min", "max", "avg", "Jan", "Feb", "Mar", "Apr", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
].join("|");
const ABBREV_RE = new RegExp(`\\b(${ABBREV})\\.$`, "i");

/**
 * Normalize and combine multiple values for the same fact key
 */
function normalizeFactValue(value: string): string {
  return value
    .trim()
    .replace(/\s{2,}/g, " ")
    .replace(/\s*[;；,，]\s*/g, " / ") // Convert separators to consistent format
    .replace(/\s*\/\s*/g, " / ") // Normalize slashes
    .replace(/\s*\(\s*/g, " (") // Normalize parentheses
    .replace(/\s*\)\s*/g, ") ")
    .replace(/-&gt;/g, "→") // Convert HTML arrows to proper symbols
    .replace(/->/g, "→"); // Convert text arrows to proper symbols
}

/**
 * Extract facts using both colon and linebreak formats
 */
function extractFacts(text: string): { facts: Fact[]; cleanedText: string } {
  const factsMap = new Map<string, Set<string>>();
  let cleanedText = text;

  // Function to process and add a fact
  const addFact = (key: string, value: string) => {
    const k = key.trim().replace(/\s+/g, " ");
    const v = normalizeFactValue(value);
    
    if (!factsMap.has(k)) {
      factsMap.set(k, new Set());
    }
    factsMap.get(k)!.add(v);
  };

  // Extract colon format facts
  COLON_FACT_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = COLON_FACT_RE.exec(text)) !== null) {
    addFact(m[1], m[2]);
  }

  // Extract linebreak format facts
  LINEBREAK_FACT_RE.lastIndex = 0;
  while ((m = LINEBREAK_FACT_RE.exec(text)) !== null) {
    addFact(m[1], m[2]);
  }

  // Convert map to array of facts, combining multiple values
  const facts: Fact[] = [];
  for (const [key, valuesSet] of factsMap) {
    const values = Array.from(valuesSet);
    
    // For certain keys, we might want to handle multiple values differently
    if (['Age', 'Height', 'Weight', 'Bounty'].includes(key)) {
      // Combine all values with " / " separator
      const combinedValue = values.join(' / ');
      facts.push({ k: key, v: combinedValue });
    } else {
      // For other keys, take the first value or combine if they're different
      if (values.length === 1) {
        facts.push({ k: key, v: values[0] });
      } else {
        // Check if values are actually different or just variations
        const uniqueValues = Array.from(new Set(values.map(v => v.toLowerCase())));
        if (uniqueValues.length === 1) {
          facts.push({ k: key, v: values[0] }); // Same value, different formatting
        } else {
          facts.push({ k: key, v: values.join(' / ') }); // Different values
        }
      }
    }
  }

  // Remove both colon and linebreak facts from text
  if (facts.length > 0) {
    // Remove colon format
    cleanedText = cleanedText.replace(COLON_FACT_RE, "");
    // Remove linebreak format
    cleanedText = cleanedText.replace(LINEBREAK_FACT_RE, "");
  }

  return { facts, cleanedText };
}

/**
 * Smarter split into paragraphs
 */
function sentencesToParagraphs(text: string): string[] {
  if (!text.trim()) return [];
  
  // Normalize and clean text
  const clean = text
    .replace(/\r\n?/g, " ")
    .replace(/\s*[;；]\s*/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!clean) return [];

  // Simple sentence splitting
  const sentences = clean.split(/(?<![A-Z][a-z]\.)(?<![A-Z]\.)(?<=[.!?])\s+(?=[A-Z])/g)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => {
      if (!s.endsWith('.') && !s.endsWith('!') && !s.endsWith('?')) {
        return s + '.';
      }
      return s;
    });

  // Group 2-3 sentences per paragraph
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const group = sentences.slice(i, Math.min(i + 2, sentences.length));
    paragraphs.push(group.join(' '));
  }

  return paragraphs;
}

/**
 * Parse character about blob into facts + paragraphs.
 */
export function parseAbout(raw?: string): ParsedAbout {
  if (!raw || typeof raw !== "string") return { facts: [], paragraphs: [] };

  // Normalize text
  let text = raw.replace(/\r\n?/g, "\n").trim();

  // 1) Extract facts using both formats
  const { facts, cleanedText } = extractFacts(text);

  // 2) Further clean the text
  const finalText = cleanedText
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+|\s+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // 3) Build paragraphs from remaining text
  const paragraphs = sentencesToParagraphs(finalText);

  return { facts, paragraphs };
}

// Utility function to get specific fact values (returns array for multi-value facts)
export function getFactValues(facts: Fact[], key: string): string[] {
  const normalizedKey = key.toLowerCase();
  const fact = facts.find(f => f.k.toLowerCase() === normalizedKey);
  if (!fact) return [];
  
  // Split by common separators to get individual values
  return fact.v.split(/\s*\/\s*|\s*;\s*|\s*,\s*/)
    .map(v => v.trim())
    .filter(v => v.length > 0);
}

// Utility function to get first fact value
export function getFactValue(facts: Fact[], key: string): string | undefined {
  const values = getFactValues(facts, key);
  return values.length > 0 ? values[0] : undefined;
}

// Utility function to check if a fact exists
export function hasFact(facts: Fact[], key: string): boolean {
  return facts.some(f => f.k.toLowerCase() === key.toLowerCase());
}

// Utility function to get all facts of a specific type as array
export function getAllFactsByKey(facts: Fact[], key: string): Fact[] {
  const normalizedKey = key.toLowerCase();
  return facts.filter(f => f.k.toLowerCase() === normalizedKey);
}