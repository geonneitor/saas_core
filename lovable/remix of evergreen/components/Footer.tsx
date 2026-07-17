interface FooterProps {
  showPlatformText?: boolean;
}

const Footer = ({ showPlatformText = false }: FooterProps) => {
  return (
    <footer className="bg-muted border-t border-border py-8 px-4 text-center">
      <p className="text-xs md:text-sm text-muted-foreground">Create A Site Like This</p>
      {showPlatformText && (
        <p className="text-xs text-muted-foreground mt-1">Powered by Evergreen Community Gardens</p>
      )}
    </footer>
  );
};

export default Footer;
