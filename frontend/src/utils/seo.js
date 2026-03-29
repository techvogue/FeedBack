const ensureMetaTag = (name) => {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  return element;
};

const ensurePropertyMetaTag = (property) => {
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  return element;
};

export const setPageMeta = ({ title, description }) => {
  if (title) {
    document.title = title;
    ensurePropertyMetaTag("og:title").setAttribute("content", title);
  }

  if (description) {
    ensureMetaTag("description").setAttribute("content", description);
    ensurePropertyMetaTag("og:description").setAttribute(
      "content",
      description,
    );
  }
};
