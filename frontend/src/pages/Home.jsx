import Hero from "../components/ui/Hero";
import Categories from "../components/ui/Categories";
import CourseList from "../components/course/CourseList";
import Stats from "../components/ui/Stats";
import Benefits from "../components/ui/Benefits";
import Testimonials from "../components/ui/Testimonials";
import BlogSection from "../components/blog/BlogSection";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <CourseList />
      <Stats />
      <Benefits />
      <Testimonials />
      <BlogSection />
    </>
  );
}
