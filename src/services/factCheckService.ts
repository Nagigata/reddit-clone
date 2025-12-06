export type FactCheckResponse = {
  claim: string;
  verdict: string;
  explanation: string;
};

const FACT_CHECK_API_URL = process.env.NEXT_PUBLIC_FACT_CHECK_API_URL;

export const factCheckService = {
  checkClaim: async (claim: string): Promise<FactCheckResponse[]> => {
    if (!FACT_CHECK_API_URL) {
      throw new Error("Fact-check API URL is not configured");
    }
    try {
      const response = await fetch(FACT_CHECK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ claim }),
      });

      if (!response.ok) {
        throw new Error(`Fact-check API error: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error("Error checking fact:", error);
      throw error;
    }
  },
};

