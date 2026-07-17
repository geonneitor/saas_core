import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import heroContact from "@/assets/hero-contact.jpg";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <HeroBanner
          image={heroContact}
          alt="Woman picking fresh tomatoes in a sunny greenhouse"
          title="Contact Us"
          subtitle="We'd love to hear from you — stop by, call, or drop us a line"
        />

        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact info */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Get In Touch</h2>
              <div className="space-y-5">
                <div className="flex gap-3 items-start">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Address</p>
                    <p className="text-sm text-muted-foreground">123 Demo Street<br />Meadowbrook, New York 12534</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <a href="mailto:hello@evergreengardens.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      hello@evergreengardens.com
                    </a>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <a href="tel:+15551234567" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      (555) 123-4567
                    </a>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Garden Hours</p>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <p>Mon – Fri: 7:00 AM – 7:00 PM</p>
                      <p>Saturday: 8:00 AM – 5:00 PM</p>
                      <p>Sunday: 9:00 AM – 3:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Send a Message</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Thank you for your message! We'll get back to you soon.");
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <input type="text" id="name" required className="w-full border border-input rounded-sm px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input type="email" id="email" required className="w-full border border-input rounded-sm px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" placeholder="you@example.com" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">Subject</label>
                  <select id="subject" className="w-full border border-input rounded-sm px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option>General Inquiry</option>
                    <option>Plot Membership</option>
                    <option>Composting Program</option>
                    <option>Youth Program</option>
                    <option>Events & Catering</option>
                    <option>Volunteering</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">Message</label>
                  <textarea id="message" rows={5} required className="w-full border border-input rounded-sm px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none" placeholder="How can we help?" />
                </div>
                <button type="submit" className="w-full px-8 py-3 text-sm font-semibold tracking-wider uppercase bg-foreground text-background rounded-sm shadow-lg hover:opacity-90 transition-all duration-200">
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="mt-12 bg-muted rounded-sm p-12 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">123 Demo Street, Meadowbrook, NY 12534</p>
            <p className="text-xs text-muted-foreground mt-1">Located just off Route 9, behind the Meadowbrook Community Center</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
