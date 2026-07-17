import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProgramBySlug } from "@/data/programs";
import { ChevronLeft, CheckCircle, Quote } from "lucide-react";

const ProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const program = slug ? getProgramBySlug(slug) : undefined;

  if (!program) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Program Not Found</h1>
            <p className="text-muted-foreground mb-6">The program you're looking for doesn't exist.</p>
            <Link to="/garden" className="text-primary hover:underline">← Back to The Garden</Link>
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
            <Link to="/garden" className="inline-flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-4 text-sm">
              <ChevronLeft className="w-4 h-4" /> The Garden
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary-foreground mb-3">
              {program.title}
            </h1>
            <p className="text-lg text-primary-foreground/80">{program.shortDesc}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          {/* Details grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {program.details.map((detail) => (
              <div key={detail.label} className="border border-border rounded-sm p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{detail.label}</p>
                <p className="text-sm font-medium text-foreground">{detail.value}</p>
              </div>
            ))}
          </div>

          {/* Long description */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">About This Program</h2>
            {program.longDescription.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed text-muted-foreground mb-4">
                {paragraph}
              </p>
            ))}
          </section>

          {/* Features */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">What's Included</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {program.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </section>

          {/* Testimonial */}
          <section className="mb-12 bg-muted rounded-sm p-8">
            <Quote className="w-8 h-8 text-primary/30 mb-3" />
            <blockquote className="text-lg leading-relaxed text-foreground italic mb-4">
              "{program.testimonial.quote}"
            </blockquote>
            <div>
              <p className="font-semibold text-foreground text-sm">{program.testimonial.author}</p>
              <p className="text-xs text-muted-foreground">{program.testimonial.role}</p>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Interested in joining?</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Reach out and we'll get you started.
            </p>
            <Link
              to="/contact"
              className="inline-block px-8 py-3 text-sm font-semibold tracking-wider uppercase bg-foreground text-background rounded-sm shadow-lg hover:opacity-90 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProgramDetail;
