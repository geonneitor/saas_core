import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import { Flower2, Apple, Salad, TreeDeciduous, Droplets, Bug, ChevronRight } from "lucide-react";
import { programs } from "@/data/programs";
import heroGarden from "@/assets/hero-garden.jpg";

const iconMap: Record<string, React.ElementType> = {
  TreeDeciduous,
  Droplets,
  Bug,
};

const Garden = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <HeroBanner
          image={heroGarden}
          alt="Lush green plants growing in a greenhouse garden"
          title="The Garden"
          subtitle="Two acres of greenhouses and open plots, growing over 60 varieties year-round"
        />

        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          {/* What we grow */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What We Grow</h2>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-8">
              Our gardens produce a rotating harvest of seasonal fruits, vegetables, herbs, and
              cut flowers — all grown organically using sustainable methods passed down through
              generations of local growers.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: Apple, title: "Fruits", items: ["Heirloom Tomatoes", "Strawberries", "Blueberries", "Figs", "Melons"] },
                { icon: Salad, title: "Vegetables & Herbs", items: ["Kale & Chard", "Snap Peas", "Basil & Cilantro", "Peppers", "Root Vegetables"] },
                { icon: Flower2, title: "Flowers", items: ["Sunflowers", "Zinnias", "Dahlias", "Lavender", "Wildflower Mixes"] },
              ].map((category) => (
                <div key={category.title} className="border border-border rounded-sm p-6">
                  <category.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-3">{category.title}</h3>
                  <ul className="space-y-1">
                    {category.items.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Programs */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Programs</h2>
            <div className="space-y-6">
              {programs.map((program) => {
                const Icon = iconMap[program.icon] || TreeDeciduous;
                return (
                  <Link to={`/programs/${program.slug}`} key={program.slug} className="block group">
                    <div className="flex gap-4 items-start border border-border rounded-sm p-6 hover:shadow-md transition-shadow duration-200">
                      <Icon className="w-8 h-8 text-primary shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-1">
                          {program.title}
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{program.shortDesc}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Seasonal calendar */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Seasonal Calendar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { season: "Spring", months: "Mar – May", highlights: "Seed starts, peas, lettuce, radishes" },
                { season: "Summer", months: "Jun – Aug", highlights: "Tomatoes, peppers, berries, sunflowers" },
                { season: "Autumn", months: "Sep – Nov", highlights: "Squash, root vegetables, apples, dahlias" },
                { season: "Winter", months: "Dec – Feb", highlights: "Greenhouse greens, herbs, planning workshops" },
              ].map((s) => (
                <div key={s.season} className="border border-border rounded-sm p-4 text-center">
                  <h3 className="font-semibold text-foreground mb-1">{s.season}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{s.months}</p>
                  <p className="text-sm text-muted-foreground">{s.highlights}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Hours */}
          <section className="bg-muted rounded-sm p-8 text-center">
            <h2 className="text-xl font-bold text-foreground mb-3">Garden Hours</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Monday – Friday: 7:00 AM – 7:00 PM</p>
              <p>Saturday: 8:00 AM – 5:00 PM</p>
              <p>Sunday: 9:00 AM – 3:00 PM</p>
            </div>
            <Link
              to="/contact"
              className="inline-block mt-6 px-8 py-3 text-sm font-semibold tracking-wider uppercase bg-foreground text-background rounded-sm shadow-lg hover:opacity-90 transition-all duration-200"
            >
              Plan Your Visit
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Garden;
