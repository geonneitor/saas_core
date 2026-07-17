import { cn } from "@/lib/utils";

interface HeroBannerProps {
  image: string;
  alt: string;
  title: string;
  subtitle?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}

const HeroBanner = ({ image, alt, title, subtitle, overlay = true, children }: HeroBannerProps) => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
      <img
        src={image}
        alt={alt}
        className="w-full h-full object-cover object-center"
        loading="lazy"
      />
      {overlay && (
        <div className="absolute inset-0 bg-foreground/60" />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        {children || (
          <>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-background mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-background/80 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
