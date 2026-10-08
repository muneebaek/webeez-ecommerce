export default function AnnouncementBar() {
  return (
    <div className="announce">
      <div className="announce__inner page-shell">
        <p className="announce__group hidden md:flex">
          <span>[ Catalogue No. 01 ]</span>
          <span className="announce__sep">/</span>
          <span>Contemporary India / 2026</span>
        </p>

        <p className="announce__group">
          <span className="announce__dot" aria-hidden="true" />
          <span>Exhibition &amp; Atelier Archive</span>
          <span className="announce__sep hidden sm:inline">|</span>
          <span className="hidden sm:inline">Curated Dispatch Worldwide</span>
        </p>
      </div>
    </div>
  );
}
