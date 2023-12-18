import fs from "fs";
import path from "path";
import * as OpenAPI from "openapi-typescript-codegen";

const SPEC_URL: string = "https://docs.hetzner.cloud/spec.json";
const SPEC_PATH: string = path.join(__dirname, "hetzner-cloud-spec.json");
const GENERATED_CLIENT_DIR: string = path.join(__dirname, "generated-client");

/**
 * Downloads the OpenAPI specification from a given URL.
 * @returns {Promise<any>} The OpenAPI specification as a JSON object.
 */
async function downloadSpec(): Promise<any> {
  try {
    const response = await fetch(SPEC_URL);
    return await response.json();
  } catch (error) {
    console.error("Error downloading the OpenAPI spec:", error);
    throw error;
  }
}

/**
 * Checks if the OpenAPI specification has changed compared to the stored version.
 * @param {any} newSpec - The newly downloaded OpenAPI specification.
 * @returns {boolean} True if the specification has changed, false otherwise.
 */
function hasSpecChanged(newSpec: any): boolean {
  if (fs.existsSync(SPEC_PATH)) {
    const existingSpec: string = fs.readFileSync(SPEC_PATH, "utf8");
    return JSON.stringify(existingSpec) !== JSON.stringify(newSpec);
  }
  return true;
}

/**
 * Generates a TypeScript client based on the given OpenAPI specification.
 * @param {any} spec - The OpenAPI specification.
 */
async function generateClient(spec: any): Promise<void> {
  await OpenAPI.generate({
    input: SPEC_PATH,
    output: GENERATED_CLIENT_DIR,
    httpClient: OpenAPI.HttpClient.FETCH,
    useOptions: true,
    useUnionTypes: true,
  });
}

/**
 * Main function to orchestrate downloading, comparing, and generating client.
 */
async function main(): Promise<void> {
  try {
    const newSpec = await downloadSpec();

    if (hasSpecChanged(newSpec)) {
      console.log("Spec has changed, generating new client...");
      fs.writeFileSync(SPEC_PATH, JSON.stringify(newSpec, null, 2));
      await generateClient(newSpec);
      console.log("Client generation complete.");
      // Here you would include logic for versioning and publishing
    } else {
      console.log("No changes in spec, no need to generate new client.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
