import { Button } from "@/components/ui/button"
import { useScraper } from "@/hooks/useScraper"

function App() {
  const { scrapeCurrentTab } = useScraper();

  return (
    <div className="bg-white flex flex-col gap-2.5 items-start p-2.5 w-[400px] h-[600px]">
      {/* Title Box */}
      <div className="bg-white flex items-center justify-center px-[68px] py-4 w-full">
        <h1
          className="font-semibold text-[#0a0a0a] text-center"
          style={{
            fontFamily: 'var(--heading-1-font-family)',
            fontSize: 'var(--heading-1-font-size)',
            lineHeight: 'var(--heading-1-line-height)',
            letterSpacing: 'var(--heading-1-letter-spacing)',
            fontWeight: 'var(--heading-1-weight)'
          }}
        >
          JobHunter
        </h1>
      </div>

      {/* Content Area */}
      <div className="bg-white flex flex-1 flex-col items-center justify-center w-full">
        <Button
          onClick={scrapeCurrentTab}
          className="bg-[#171717] text-[#fafafa] hover:bg-[#171717]/90 min-h-[40px] px-6 py-2.5 rounded-lg"
          style={{
            fontFamily: 'var(--paragraph-small-font-family)',
            fontSize: 'var(--paragraph-small-font-size)',
            fontWeight: 'var(--paragraph-small-weight)',
            letterSpacing: 'var(--paragraph-small-letter-spacing)',
            lineHeight: 0
          }}
        >
          Scrape
        </Button>
      </div>
    </div>
  );
}

export default App;
