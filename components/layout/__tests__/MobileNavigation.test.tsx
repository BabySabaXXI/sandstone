import { render, screen, fireEvent } from "@testing-library/react";
import { MobileNavigation } from "../MobileNavigation";
import { usePathname } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("MobileNavigation", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/");
  });

  it("renders all navigation items", () => {
    render(<MobileNavigation />);

    expect(screen.getByLabelText("Home")).toBeInTheDocument();
    expect(screen.getByLabelText("Grade")).toBeInTheDocument();
    expect(screen.getByLabelText("Cards")).toBeInTheDocument();
    expect(screen.getByLabelText("Quiz")).toBeInTheDocument();
    expect(screen.getByLabelText("Library")).toBeInTheDocument();
  });

  it("marks active item correctly", () => {
    (usePathname as jest.Mock).mockReturnValue("/grade");
    render(<MobileNavigation />);

    const gradeLink = screen.getByLabelText("Grade");
    expect(gradeLink).toHaveAttribute("aria-current", "page");
  });

  it("has minimum touch target size of 44px", () => {
    render(<MobileNavigation />);

    const navItems = screen.getAllByRole("link");
    navItems.forEach((item) => {
      const styles = window.getComputedStyle(item);
      const minWidth = parseInt(styles.minWidth, 10);
      const minHeight = parseInt(styles.minHeight, 10);
      
      expect(minWidth).toBeGreaterThanOrEqual(44);
      expect(minHeight).toBeGreaterThanOrEqual(44);
    });
  });

  it("navigates to correct routes on click", () => {
    render(<MobileNavigation />);

    const gradeLink = screen.getByLabelText("Grade");
    expect(gradeLink).toHaveAttribute("href", "/grade");
  });
});
