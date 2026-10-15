/**
 * Rule-based complaint classifier. This mirrors the logic that used to live
 * client-side (mockDb.analyzeComplaintDescription) so the "AI assessment"
 * category, laws and suggested authority stay identical now that it runs
 * server-side. Swap this out for a real ML/LLM call later without touching
 * any caller — the input/output shape is what matters.
 *
 * @param {string} description
 * @returns {{category: string, understanding: string, relevantLaws: string[], suggestedAuthority: string}}
 */
function analyzeComplaintDescription(description = "") {
  const lowercase = description.toLowerCase();

  let category = "General Municipal Issue";
  let understanding =
    "AI Classification: Public grievances noted from description. Verification unit recommended for onsite visit.";
  let relevantLaws = [
    "Sec 44 of Municipal Corporation Code: Core functions and basic civic standards.",
    "General Law of Public Nuisance: Standard administrative rules on local environment maintenance.",
  ];
  let suggestedAuthority = "General Grievance Redressal Cell";

  if (
    lowercase.includes("garbage") ||
    lowercase.includes("waste") ||
    lowercase.includes("refuse") ||
    lowercase.includes("litter") ||
    lowercase.includes("dump")
  ) {
    category = "Waste & Sanitation";
    understanding =
      "Garbage accumulation has been reported near a public area. Sidewalk blockages and bio-hazards require solid waste collection team dispatch.";
    relevantLaws = [
      "Section 15 of Solid Waste Management Rules: Prohibits dumping of municipal waste on streets.",
      "Article 21 (Constitution of India): Right to a clean and healthy environment.",
    ];
    suggestedAuthority = "Municipal Waste Department XYZ";
  } else if (
    lowercase.includes("light") ||
    lowercase.includes("lamp") ||
    lowercase.includes("bulb") ||
    lowercase.includes("dark")
  ) {
    category = "Public Utilities";
    understanding =
      "Dysfunctional street lighting reported, creating safety hazards and dark zones. Recommends technician team for bulb replacement and power grid checks.";
    relevantLaws = [
      "Municipal Corporations Act, Sec 304: Mandate to light public streets.",
      "Bureau of Indian Standards Code (IS:1944): Guidelines for lighting levels on public pathways.",
    ];
    suggestedAuthority = "Electrical & Street Lighting Wing";
  } else if (
    lowercase.includes("pot") ||
    lowercase.includes("road") ||
    lowercase.includes("street") ||
    lowercase.includes("asphalt") ||
    lowercase.includes("hole")
  ) {
    category = "Roads & Infrastructure";
    understanding =
      "Potholes or cracked road conditions reported. Poses a severe threat to vehicle tires, cyclist balance, and traffic flow.";
    relevantLaws = [
      "Motor Vehicles Act, Sec 198A: Liability of authorities for design and maintenance standards.",
      "National Highways and Civic Roads Act: Legal duty to maintain pothole-free safe roads.",
    ];
    suggestedAuthority = "Department of Public Works (PWD) Road Division";
  } else if (
    lowercase.includes("water") ||
    lowercase.includes("sewage") ||
    lowercase.includes("pipe") ||
    lowercase.includes("leak") ||
    lowercase.includes("drain")
  ) {
    category = "Water & Drainage";
    understanding =
      "Contaminated water supply or sewage water leak. Risk of waterborne diseases and civic contamination.";
    relevantLaws = [
      "Water (Prevention and Control of Pollution) Act: Mandates drinking water quality preservation.",
      "Public Health Act Section 23: Regulations regarding public drains and sewage overflow prevention.",
    ];
    suggestedAuthority = "Water Supply & Sewerage Board";
  }

  return { category, understanding, relevantLaws, suggestedAuthority };
}

module.exports = { analyzeComplaintDescription };
