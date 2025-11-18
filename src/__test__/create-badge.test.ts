import { createBadge } from "../../scripts/create-badge";
import fetchMock from "jest-fetch-mock";

describe("createBadge", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should create and upload a badge successfully", async () => {
    const badgeSvg = '<svg>test badge</svg>';
    const gistResponse = { status: "ok" };

    fetchMock
      .mockResponseOnce(badgeSvg) // Badge from shields.io
      .mockResponseOnce(JSON.stringify(gistResponse)); // Gist upload

    await createBadge({
      gistID: "test-gist-id",
      filename: "test.svg",
      label: "Test Label",
      message: "passing",
      color: "green",
      githubToken: "test-token",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Check shields.io call
    const firstCall = fetchMock.mock.calls[0][0] as string;
    expect(firstCall).toContain("img.shields.io");
    expect(firstCall).toContain("Test%20Label");
    expect(firstCall).toContain("passing");
    expect(firstCall).toContain("green");

    // Check GitHub API call
    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://api.github.com/gists/test-gist-id"
    );
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "PATCH",
      headers: {
        Authorization: "token test-token",
        Accept: "application/vnd.github.v3+json",
      },
    });
  });

  it("should process special characters in label and message", async () => {
    fetchMock
      .mockResponseOnce('<svg>badge</svg>')
      .mockResponseOnce(JSON.stringify({ status: "ok" }));

    await createBadge({
      gistID: "test-gist-id",
      filename: "test.svg",
      label: "test-label",
      message: "up_to_date",
      color: "blue",
      githubToken: "test-token",
    });

    const badgeUrl = fetchMock.mock.calls[0][0] as string;
    // Hyphens and underscores should be escaped
    expect(badgeUrl).toContain("test--label");
    expect(badgeUrl).toContain("up__to__date");
  });

  it("should handle badge fetch errors gracefully", async () => {
    fetchMock.mockRejectOnce(new Error("Failed to fetch badge"));

    await createBadge({
      gistID: "test-gist-id",
      filename: "test.svg",
      label: "Test",
      message: "fail",
      color: "red",
      githubToken: "test-token",
    });

    expect(console.error).toHaveBeenCalledWith("Error:", expect.any(Error));
  });

  it("should handle GitHub API errors gracefully", async () => {
    fetchMock
      .mockResponseOnce('<svg>badge</svg>')
      .mockResponseOnce(JSON.stringify({ message: "Not found" }), {
        status: 404,
      });

    await createBadge({
      gistID: "invalid-gist-id",
      filename: "test.svg",
      label: "Test",
      message: "fail",
      color: "red",
      githubToken: "test-token",
    });

    expect(console.error).toHaveBeenCalledWith(
      "Gist API response:",
      expect.objectContaining({ message: "Not found" })
    );
    expect(console.error).toHaveBeenCalledWith("Error:", expect.any(Error));
  });

  it("should encode URL parameters correctly", async () => {
    fetchMock
      .mockResponseOnce('<svg>badge</svg>')
      .mockResponseOnce(JSON.stringify({ status: "ok" }));

    await createBadge({
      gistID: "test-gist-id",
      filename: "test.svg",
      label: "Coverage",
      message: "85%",
      color: "brightgreen",
      githubToken: "test-token",
    });

    const badgeUrl = fetchMock.mock.calls[0][0] as string;
    expect(badgeUrl).toContain("Coverage");
    expect(badgeUrl).toContain("85%25"); // % should be encoded
  });
});
