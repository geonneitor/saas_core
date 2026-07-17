import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import { Clock, MapPin } from "lucide-react";
import { events } from "@/data/events";
import heroEvents from "@/assets/hero-events.jpg";

const Events = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <HeroBanner
          image={heroEvents}
          alt="Elegant outdoor garden event with floral arrangements"
          title="Upcoming Events"
          subtitle="Workshops, dinners, and community gatherings — there's always something growing here"
        />

        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <div className="space-y-8">
            {events.map((event) => (
              <Link to={`/events/${event.slug}`} key={event.slug} className="block">
                <article className="border border-border rounded-sm p-6 md:p-8 hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-xs font-semibold tracking-wider uppercase px-2 py-1 bg-primary/10 text-primary rounded-sm">
                      {event.tag}
                    </span>
                    <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                      {event.date}
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">{event.title}</h2>
                  <p className="text-base text-muted-foreground leading-relaxed mb-4">{event.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {event.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> {event.location}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Want to be the first to hear about new events?
            </p>
            <Link
              to="/contact"
              className="inline-block px-8 py-3 text-sm font-semibold tracking-wider uppercase bg-foreground text-background rounded-sm shadow-lg hover:opacity-90 transition-all duration-200"
            >
              Join Our Mailing List
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Events;
