# Demo property photos

Drop photos here as `property-1.jpg` ... `property-8.jpg` (jpg, jpeg, png or webp), one per
property in the order of the Overview table. They appear as thumbnails on /demo only (never on the
homepage), lazy loaded. The build resizes them and converts them to WebP automatically
(Astro's image pipeline), so originals of any reasonable size are fine.

They live here, not in public/, because only files under src/ go through the image pipeline.
Until a photo exists, a line icon for the property's asset type is shown instead.
Use only photos you have the rights to, and nothing that identifies a real property.
