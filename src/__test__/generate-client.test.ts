import {
  downloadSpec,
  hasSpecChanged,
  generateClient,
  main,
} from "../generate-client"; // Replace with your actual module name
import fs from "fs";
import fetchMock from "jest-fetch-mock";
import * as OpenAPI from "openapi-typescript-codegen";

jest.mock("fs");

describe("OpenAPI Specification Handling", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  describe("downloadSpec", () => {
    it("should download the spec successfully", async () => {
      const mockSpec = { mockKey: "mockValue" };
      fetchMock.mockResponseOnce(JSON.stringify(mockSpec));

      const spec = await downloadSpec();
      expect(spec).toEqual(mockSpec);
    });

    it("should throw an error when download fails", async () => {
      fetchMock.mockReject(new Error("Network failure"));

      await expect(downloadSpec()).rejects.toThrow("Network failure");
    });
  });

  describe("hasSpecChanged", () => {
    it("should return true if spec file does not exist", () => {
      jest.spyOn(fs, "existsSync").mockReturnValueOnce(false);

      expect(hasSpecChanged({})).toBe(true);
    });

    it("should return false if the spec has not changed", () => {
      jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
      jest
        .spyOn(fs, "readFileSync")
        .mockReturnValueOnce(JSON.stringify({ mockKey: "mockValue" }));

      expect(hasSpecChanged({ mockKey: "mockValue" })).toBe(false);
    });

    it("should return true if the spec has changed", () => {
      jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
      jest
        .spyOn(fs, "readFileSync")
        .mockReturnValueOnce(JSON.stringify({ mockKey: "oldValue" }));

      expect(hasSpecChanged({ mockKey: "newValue" })).toBe(true);
    });
  });

  describe("generateClient", () => {
    it("should call OpenAPI.generate with the correct arguments", async () => {
      const mockGenerate = jest.spyOn(OpenAPI, "generate").mockResolvedValue();

      await generateClient({ mockKey: "mockValue" });

      expect(mockGenerate).toHaveBeenCalledWith({
        input: expect.any(String),
        output: expect.any(String),
        httpClient: OpenAPI.HttpClient.FETCH,
        useOptions: true,
        useUnionTypes: true,
      });
    });
  });

  describe("main", () => {
    it("should generate new client if spec has changed", async () => {
      jest.spyOn(global, "fetch").mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ mockKey: "newValue" }),
      } as unknown as Response);
      jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
      jest
        .spyOn(fs, "readFileSync")
        .mockReturnValueOnce(JSON.stringify({ mockKey: "oldValue" }));
      jest.spyOn(fs, "writeFileSync").mockImplementationOnce(() => {});
      const mockGenerate = jest.spyOn(OpenAPI, "generate").mockResolvedValue();

      await main();

      expect(mockGenerate).toHaveBeenCalledTimes(1);
    });

    it("should not generate new client if spec has not changed", async () => {
      jest.spyOn(global, "fetch").mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ mockKey: "sameValue" }),
      } as unknown as Response);
      jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
      jest
        .spyOn(fs, "readFileSync")
        .mockReturnValueOnce(JSON.stringify({ mockKey: "sameValue" }));
      const mockGenerate = jest.spyOn(OpenAPI, "generate").mockResolvedValue();

      await main();

      expect(mockGenerate).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const consoleErrorMock = jest
        .spyOn(console, "error")
        .mockImplementationOnce(() => {});
      jest
        .spyOn(global, "fetch")
        .mockRejectedValueOnce(new Error("Failed to fetch"));

      await main();

      expect(consoleErrorMock).toHaveBeenCalledWith(
        "An error occurred:",
        expect.any(Error)
      );
    });
  });
});
