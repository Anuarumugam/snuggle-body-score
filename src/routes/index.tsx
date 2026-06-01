import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Personal BMI Calculator" },
      { name: "description", content: "Calculate your Body Mass Index instantly with this simple, mobile-friendly BMI calculator." },
      { property: "og:title", content: "Personal BMI Calculator" },
      { property: "og:description", content: "Calculate your Body Mass Index instantly with this simple, mobile-friendly BMI calculator." },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/bmi.html");
  }, []);
  return null;
}
