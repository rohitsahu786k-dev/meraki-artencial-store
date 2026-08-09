import { CollectionBrowser } from "@/components/collection-browser";
import { stripHtml } from "@/lib/utils";

export function CollectionShell({ title, description, products = [], categories = [], attributes = [], basePath = "/shop", activeQuery = {} }) {
  return (
    <div className="collection-page">
      <div className="container">
        <div className="collection-heading">
          <div>
            <span className="eyebrow">Meraki collection</span>
            <h1>{title}</h1>
            {description ? <p>{stripHtml(description).slice(0, 180)}</p> : null}
          </div>
        </div>
        <CollectionBrowser products={products} categories={categories} attributes={attributes} basePath={basePath} activeQuery={activeQuery} />
      </div>
    </div>
  );
}
