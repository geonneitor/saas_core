import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import { Leaf, Users, Sun, Sprout } from "lucide-react";
import { teamMembers } from "@/data/team";
import heroAbout from "@/assets/hero-about.jpg";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <HeroBanner
          image={heroAbout}
          alt="Watering plants in a lush community garden"
          title="About Our Gardens"
          subtitle="Growing community, one seed at a time since 2024"
        />

        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          {/* Mission */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-4">
              Evergreen Community Gardens was founded with a simple belief: that everyone deserves
              access to fresh, sustainably-grown produce and the joy of connecting with the earth.
              Nestled in the heart of Meadowbrook, New York, our gardens span two acres of
              lovingly-maintained greenhouses and open-air plots.
            </p>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
              We're more than just a garden — we're a gathering place where neighbors become friends,
              children learn where food comes from, and the community grows together through every
              season.
            </p>
          </section>

          {/* Values */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">What We Stand For</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Leaf, title: "Sustainability", desc: "From composting programs to rainwater harvesting, every decision we make keeps the planet in mind." },
                { icon: Users, title: "Community", desc: "Over 200 families participate in our programs, sharing knowledge, harvests, and countless meals together." },
                { icon: Sun, title: "Education", desc: "Weekly workshops teach composting, organic pest control, seed saving, and seasonal planting techniques." },
                { icon: Sprout, title: "Accessibility", desc: "Sliding-scale memberships and free youth programs ensure that everyone can participate regardless of income." },
              ].map((item) => (
                <div key={item.title} className="border border-border rounded-sm p-6">
                  <item.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Meet the Team</h2>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-6">
              Our dedicated team of gardeners, educators, and volunteers make Evergreen possible.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {teamMembers.map((person) => (
                <Link to={`/team/${person.slug}`} key={person.slug} className="group text-center md:text-left">
                  <div className="w-20 h-20 rounded-full bg-muted mx-auto md:mx-0 mb-3 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors">
                      {person.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{person.name}</h3>
                  <p className="text-sm text-primary font-medium mb-1">{person.role}</p>
                  <p className="text-sm text-muted-foreground">{person.shortBio}</p>
                </Link>
              ))}
            </div>
          </section>

          <div className="text-center">
            <Link
              to="/contact"
              className="inline-block px-8 py-3 text-sm font-semibold tracking-wider uppercase bg-foreground text-background rounded-sm shadow-lg hover:opacity-90 transition-all duration-200"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
