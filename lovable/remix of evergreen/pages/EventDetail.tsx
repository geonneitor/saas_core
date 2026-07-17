import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getEventBySlug } from "@/data/events";
import { Clock, MapPin, Users, DollarSign, ChevronLeft, CheckCircle } from "lucide-react";

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = slug ? getEventBySlug(slug) : undefined;

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist.</p>
            <Link to="/events" className="text-primary hover:underline">← Back to Events</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="bg-primary py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <Link to="/events" className="inline-flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-4 text-sm">
              <ChevronLeft className="w-4 h-4" /> All Events
            </Link>
            <span className="inline-block text-xs font-semibold tracking-wider uppercase px-2 py-1 bg-primary-foreground/20 text-primary-foreground rounded-sm mb-4 ml-3">
              {event.tag}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary-foreground mb-3">
              {event.title}
            </h1>
            <p className="text-lg text-primary-foreground/80">{event.description}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          {/* Quick details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Clock, label: "Date & Time", value: `${event.date}\n${event.time}` },
              { icon: MapPin, label: "Location", value: event.location },
              { icon: Users, label: "Capacity", value: event.capacity },
              { icon: DollarSign, label: "Cost", value: event.cost },
            ].map((item) => (
              <div key={item.label} className="border border-border rounded-sm p-4">
                <item.icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                <p className="text-sm font-medium text-foreground whitespace-pre-line">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Long description */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">About This Event</h2>
            {event.longDescription.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed text-muted-foreground mb-4">
                {paragraph}
              </p>
            ))}
          </section>

          {/* Schedule */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Schedule</h2>
            <div className="space-y-0">
              {event.schedule.map((item, i) => (
                <div key={i} className="flex gap-4 items-start py-3 border-b border-border last:border-b-0">
                  <span className="text-sm font-semibold text-primary whitespace-nowrap min-w-[90px]">{item.time}</span>
                  <span className="text-sm text-foreground">{item.activity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* What to bring */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">What to Bring</h2>
            <ul className="space-y-2">
              {event.whatToBring.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* CTA */}
          <div className="bg-muted rounded-sm p-8 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Ready to join us?</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              {event.cost === "Free" ? "This event is free and open to all." : `Tickets: ${event.cost}`}
            </p>
            <Link
              to="/contact"
              className="inline-block px-8 py-3 text-sm font-semibold tracking-wider uppercase bg-foreground text-background rounded-sm shadow-lg hover:opacity-90 transition-all duration-200"
            >
              RSVP Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetail;
