import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Block } from "@/components/editor/Block";
import { TextContent } from "@/types/notion";

describe("Block Component", () => {
  const mockContent: TextContent[] = [{ text: "Test content" }];
  const mockOnUpdate = jest.fn();
  const mockOnFocus = jest.fn();
  const mockOnBlur = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render paragraph block", () => {
    render(
      <Block
        id="test-id"
        type="paragraph"
        content={mockContent}
        onUpdate={mockOnUpdate}
        onFocus={mockOnFocus}
        onBlur={mockOnBlur}
      />
    );

    const block = screen.getByText("Test content");
    expect(block).toBeInTheDocument();
  });

  it("should call onUpdate when content changes", () => {
    render(
      <Block
        id="test-id"
        type="paragraph"
        content={mockContent}
        onUpdate={mockOnUpdate}
        onFocus={mockOnFocus}
        onBlur={mockOnBlur}
      />
    );

    const block = screen.getByText("Test content");
    fireEvent.input(block, { target: { textContent: "Updated content" } });

    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it("should render heading1 block", () => {
    render(
      <Block
        id="test-id"
        type="heading1"
        content={mockContent}
        onUpdate={mockOnUpdate}
        onFocus={mockOnFocus}
        onBlur={mockOnBlur}
      />
    );

    const block = screen.getByText("Test content");
    expect(block).toHaveClass("notion-heading1");
  });

  it("should call onEnter when Enter is pressed", () => {
    const mockOnEnter = jest.fn();
    render(
      <Block
        id="test-id"
        type="paragraph"
        content={mockContent}
        onUpdate={mockOnUpdate}
        onEnter={mockOnEnter}
        onFocus={mockOnFocus}
        onBlur={mockOnBlur}
      />
    );

    const block = screen.getByText("Test content");
    fireEvent.keyDown(block, { key: "Enter", shiftKey: false });

    expect(mockOnEnter).toHaveBeenCalled();
  });
});
