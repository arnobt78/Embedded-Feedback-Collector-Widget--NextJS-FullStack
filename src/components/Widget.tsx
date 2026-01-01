/**
 * Widget Component - Main Feedback Collection Widget
 *
 * This is a reusable feedback widget component that can be embedded in any web application.
 * It provides a floating button that opens a popover with a feedback form.
 *
 * Key Features:
 * - Collects user feedback (name, email, message, and star rating)
 * - Configurable API endpoint via props
 * - Real-time form validation and error handling
 * - Success state after submission
 * - Accessible UI components from Radix UI
 */

"use client"; // Required for Next.js App Router - marks this as a Client Component (runs in browser)

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useState, FormEvent, useEffect, useRef } from "react";

interface WidgetProps {
  apiBase?: string;
}

/**
 * Widget Component
 *
 * @param props - Component props
 * @param props.apiBase - The API endpoint URL for submitting feedback (defaults to "/api/feedback")
 * @returns The feedback widget component
 */
export default function Widget({ apiBase = "/api/feedback" }: WidgetProps) {
  // State management using React hooks
  // rating: Current selected star rating (1-5), defaults to 3
  const [rating, setRating] = useState<number>(3);
  // submitted: Boolean flag to show success message after form submission
  const [submitted, setSubmitted] = useState<boolean>(false);
  // loading: Boolean flag to disable button and show loading state during API call
  const [loading, setLoading] = useState<boolean>(false);
  // error: String to store and display error messages from API or network failures
  const [error, setError] = useState<string>("");
  // isOpen: Boolean flag to control popover visibility (simple state-based solution for Shadow DOM)
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  /**
   * Handles star rating selection
   * @param index - The zero-based index of the clicked star (0-4)
   * Converts to 1-based rating (1-5) for better UX and database storage
   */
  const onSelectStar = (index: number): void => {
    setRating(index + 1);
  };

  /**
   * Handles form submission
   * Collects form data and sends it to the API endpoint
   *
   * @param e - Form submit event
   *
   * Process:
   * 1. Prevents default form submission (page reload)
   * 2. Extracts form values using native form API
   * 3. Sends POST request to configurable API endpoint
   * 4. Handles success/error states appropriately
   * 5. Optionally triggers external dashboard refresh if callback exists
   */
  const submit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault(); // Prevent default form submission (page reload)
    setLoading(true); // Show loading state
    setError(""); // Clear any previous errors

    // Extract form values using native form API (no need for controlled inputs for simple forms)
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("feedback") as HTMLTextAreaElement)
      .value;

    // POST to configurable API endpoint
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, rating }), // Send all form data as JSON
      });

      if (!res.ok) {
        // Handle API errors (400, 500, etc.)
        const data = await res.json();
        setError(data.error || "Failed to submit feedback");
      } else {
        // Success - show thank you message
        setSubmitted(true);

        // Try to refresh dashboard if available
        // This allows integration with external dashboards that might display feedback
        // Uses window global to avoid tight coupling
        if (typeof window !== "undefined") {
          const win = window as typeof window & {
            refreshFeedbackDashboard?: () => void;
          };
          if (win.refreshFeedbackDashboard) {
            win.refreshFeedbackDashboard();
          }
        }
      }
    } catch (err) {
      // Handle network errors (no internet, CORS issues, etc.)
      setError("Network error");
    } finally {
      setLoading(false); // Always reset loading state
    }
  };

  return (
    // Fixed positioning keeps widget always visible in bottom-right corner
    // z-50 ensures it appears above most content
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 999999,
      }}
    >
      <div className="widget" ref={popoverRef} style={{ position: "relative" }}>
        {/* Simple state-based popover for Shadow DOM compatibility */}
        <Button
          className="rounded-full shadow-lg hover:scale-105"
          style={{
            background:
              "linear-gradient(to right, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.6), rgba(59, 130, 246, 0.4))",
            boxShadow: "0 15px 35px rgba(59, 130, 246, 0.45)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(4px)",
            transition: "all 0.2s",
          }}
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(to right, rgba(59, 130, 246, 0.9), rgba(59, 130, 246, 0.7), rgba(59, 130, 246, 0.5))";
            e.currentTarget.style.borderColor = "rgba(147, 197, 253, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(to right, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.6), rgba(59, 130, 246, 0.4))";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
          }}
        >
          <MessageCircleIcon className="mr-2 h-5 w-5" />
          Feedback
        </Button>
        {isOpen && (
          <div
            className="backdrop-blur-xl"
            style={{
              position: "absolute",
              bottom: "100%",
              right: "0",
              marginBottom: "0.5rem",
              width: "360px",
              maxWidth: "90vw",
              background:
                "linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.85))",
              borderRadius: "28px",
              padding: "1.5rem",
              boxShadow:
                "0 30px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.4)",
              border: "1px solid rgba(59, 130, 246, 0.5)",
              zIndex: 999999,
              backdropFilter: "blur(16px)",
              transition: "all 0.2s",
            }}
          >
            {submitted ? (
              <div
                className="backdrop-blur-sm"
                style={{
                  background:
                    "linear-gradient(to bottom right, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))",
                  borderRadius: "20px",
                  border: "1px solid rgba(110, 231, 183, 0.4)",
                  padding: "1.5rem",
                  boxShadow: "0 20px 60px rgba(16, 185, 129, 0.4)",
                }}
              >
                <h3
                  className="text-lg font-bold"
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                    color: "rgba(255, 255, 255, 0.98)",
                  }}
                >
                  Thank you for your feedback!
                </h3>
                <p
                  style={{
                    marginTop: "1rem",
                    color: "rgba(255, 255, 255, 0.85)",
                  }}
                >
                  We appreciate your feedback. It helps us improve our product
                  and provide better service to our customers.
                </p>
              </div>
            ) : (
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: "1.5rem",
                    color: "rgba(255, 255, 255, 0.98)",
                    textAlign: "center",
                  }}
                >
                  Send us your feedback
                </h3>
                <form
                  className="space-y-2"
                  onSubmit={submit}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.875rem",
                  }}
                >
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                    className="backdrop-blur-md w-full"
                    style={{
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(59, 130, 246, 0.4)",
                      color: "rgba(255, 255, 255, 0.95)",
                      padding: "0.75rem",
                      borderRadius: "12px",
                      width: "100%",
                      fontSize: "0.95rem",
                    }}
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Your email"
                    required
                    className="backdrop-blur-md w-full"
                    style={{
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(59, 130, 246, 0.4)",
                      color: "rgba(255, 255, 255, 0.95)",
                      padding: "0.75rem",
                      borderRadius: "12px",
                      width: "100%",
                      fontSize: "0.95rem",
                    }}
                  />
                  <Textarea
                    id="feedback"
                    name="feedback"
                    placeholder="Tell us what you think..."
                    className="min-h-[100px] backdrop-blur-md w-full"
                    required
                    style={{
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(59, 130, 246, 0.4)",
                      color: "rgba(255, 255, 255, 0.95)",
                      padding: "0.75rem",
                      borderRadius: "12px",
                      width: "100%",
                      fontSize: "0.95rem",
                      resize: "none",
                    }}
                  />
                  <div
                    className="backdrop-blur-md"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(15, 23, 42, 0.5)",
                      padding: "0.875rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(59, 130, 246, 0.35)",
                    }}
                  >
                    {/* Star Rating Component */}
                    {/* Creates 5 clickable stars using Array spread and map */}
                    {/* Visual state: filled (yellow) for selected, empty (gray) for unselected */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {[...Array(5)].map((_, index) => (
                        <StarIcon
                          key={index}
                          filled={rating > index} // Show filled if rating is greater than current index
                          className={`h-5 w-5 cursor-pointer transition-colors ${
                            rating > index
                              ? "fill-amber-400 stroke-amber-400" // Selected: yellow
                              : "fill-none stroke-gray-400" // Unselected: gray outline
                          }`}
                          onClick={() => onSelectStar(index)} // Click updates rating state
                          style={{
                            filter:
                              rating > index
                                ? "drop-shadow(0 2px 8px rgba(251, 191, 36, 0.5))"
                                : "none",
                          }}
                        />
                      ))}
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="backdrop-blur-sm"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(16, 185, 129, 0.85), rgba(16, 185, 129, 0.7), rgba(5, 150, 105, 0.6))",
                        boxShadow: "0 8px 25px rgba(16, 185, 129, 0.5)",
                        border: "1px solid rgba(110, 231, 183, 0.4)",
                        color: "white",
                        fontWeight: 600,
                        borderRadius: "12px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, rgba(16, 185, 129, 0.95), rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.7))";
                          e.currentTarget.style.borderColor =
                            "rgba(110, 231, 183, 0.6)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, rgba(16, 185, 129, 0.85), rgba(16, 185, 129, 0.7), rgba(5, 150, 105, 0.6))";
                          e.currentTarget.style.borderColor =
                            "rgba(255, 255, 255, 0.1)";
                        }
                      }}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                  {error && (
                    <p
                      className="text-red-500 text-sm backdrop-blur-sm"
                      style={{
                        color: "rgba(239, 68, 68, 0.95)",
                        fontSize: "0.875rem",
                        marginTop: "0.5rem",
                        background: "rgba(239, 68, 68, 0.1)",
                        padding: "0.5rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      {error}
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface StarIconProps extends React.SVGProps<SVGSVGElement> {
  filled?: boolean;
}

/**
 * StarIcon Component - Reusable SVG star icon
 *
 * @param props - Component props
 * @param props.filled - Whether the star should be filled or outlined
 *
 * Uses SVG for crisp rendering at any size and easy color customization
 */
function StarIcon({ filled, ...props }: StarIconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/**
 * MessageCircleIcon Component - Message bubble icon for the widget trigger button
 *
 * Uses Lucide icon design patterns with SVG for consistent styling
 * @param props - Props passed to SVG element (className, size, etc.)
 */
function MessageCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-message-circle"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
