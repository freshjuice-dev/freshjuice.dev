---
title: Schema Pro
desc: Complete documentation for the Schema Pro HubSpot module. Add JSON-LD structured data (Schema.org markup) to your pages for enhanced SEO and Google Rich Results.
---

👉 [View module on HubSpot Marketplace](https://app.hubspot.com/l/ecosystem/marketplace/modules/schema-pro-module-by-freshjuice)

The **Schema Pro** module allows you to add JSON-LD structured data (Schema.org markup) to any HubSpot page. It helps improve SEO by providing search engines with structured information about your content, enabling Google Rich Results like FAQ snippets, star ratings, event listings, and more.

**Key Feature:** No visual rendering — outputs only `<script type="application/ld+json">` tags in the page head.

---

## Quick Navigation

- [Organization](#organization)
- [WebSite](#website)
- [BreadcrumbList](#breadcrumblist)
- [FAQPage](#faqpage)
- [LocalBusiness](#localbusiness)
- [Article](#article)
- [Product](#product)
- [Service](#service)
- [SoftwareApplication](#softwareapplication)
- [Review / AggregateRating](#review--aggregaterating)
- [HowTo](#howto)
- [VideoObject](#videoobject)
- [Event](#event)
- [Person](#person)
- [JobPosting](#jobposting)
- [Testing Resources](#testing-resources)

---

## Organization

Defines your company, brand, or organization with contact info, logo, and social profiles.

### Use Cases

- Homepage or "About Us" page
- Any page where you want to establish brand identity
- Company-wide schema (typically placed once per site)

### Google Rich Results

**Knowledge Panel** — displays company info, logo, and social links in search results sidebar.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "FreshJuice",
  "url": "https://freshjuice.dev",
  "logo": "https://freshjuice.dev/img/logo.png",
  "description": "Premium HubSpot themes and modules for modern marketers.",
  "email": "hello@freshjuice.dev",
  "telephone": "+1-555-123-4567",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94102",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://twitter.com/freshjuicedev",
    "https://linkedin.com/company/freshjuice",
    "https://github.com/freshjuice-dev"
  ]
}
```

---

## WebSite

Provides site-wide information and enables the Sitelinks Searchbox in Google.

### Use Cases

- Homepage only (one per website)
- Sites with internal search functionality

### Google Rich Results

**Sitelinks Searchbox** — adds a search box directly in Google search results that queries your site.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "FreshJuice",
  "url": "https://freshjuice.dev",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://freshjuice.dev/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

---

## BreadcrumbList

Represents the navigation path to a page within the site hierarchy.

### Use Cases

- Any page with hierarchical navigation
- Documentation pages
- Category/subcategory pages
- Product pages within catalogs

### Google Rich Results

**Breadcrumb Trail** — displays clickable navigation path in search results (e.g., "Home > Products > Category > Item").

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://freshjuice.dev"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Docs",
      "item": "https://freshjuice.dev/docs/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Modules",
      "item": "https://freshjuice.dev/docs/modules/"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Schema Pro"
    }
  ]
}
```

> **Tip:** The module can auto-generate breadcrumbs from your URL structure, or you can define them manually.

---

## FAQPage

Structures question-and-answer content on a page.

### Use Cases

- FAQ pages
- Product pages with common questions
- Support/help center pages
- Any page with Q&A sections

### Google Rich Results

**Expandable FAQ Snippets** — displays questions with expandable answers directly in search results, significantly increasing SERP real estate.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Schema Pro?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Schema Pro is a HubSpot module that adds JSON-LD structured data to your pages, helping search engines understand your content and enabling rich results."
      }
    },
    {
      "@type": "Question",
      "name": "How do I install Schema Pro?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can install Schema Pro from the HubSpot Marketplace. Simply add the module to any page and configure it in the sidebar panel."
      }
    },
    {
      "@type": "Question",
      "name": "Does Schema Pro affect page speed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Schema Pro only outputs lightweight JSON-LD scripts in the page head with no CSS or JavaScript that could impact performance."
      }
    }
  ]
}
```

---

## LocalBusiness

Describes a physical business location with address, hours, and contact details.

### Use Cases

- Location pages
- "Contact Us" pages with physical addresses
- Store locator pages
- Multi-location businesses (one schema per location)

### Google Rich Results

**Local Pack** — appears in Google Maps and local search results with address, hours, phone, and directions. **Maps Integration** — displays your business on Google Maps.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "FreshJuice HQ",
  "image": "https://freshjuice.dev/img/office.jpg",
  "url": "https://freshjuice.dev",
  "telephone": "+1-555-123-4567",
  "email": "hello@freshjuice.dev",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street, Suite 400",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94102",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ]
}
```

---

## Article

Marks up news articles, blog posts, and editorial content.

### Use Cases

- Blog posts
- News articles
- Magazine/editorial content
- Any long-form written content

### Google Rich Results

**Article Rich Results** — displays headline, author, date, and thumbnail in search results. Can appear in Google News and Top Stories carousel.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Getting Started with HubSpot Schema Markup",
  "description": "Learn how to implement structured data on your HubSpot website to improve SEO and enable rich results.",
  "image": "https://freshjuice.dev/blog/schema-guide/featured.jpg",
  "datePublished": "2024-01-15T09:00:00+00:00",
  "dateModified": "2024-01-20T14:30:00+00:00",
  "author": {
    "@type": "Person",
    "name": "Alex Zappa",
    "url": "https://freshjuice.dev/authors/reatlat/"
  },
  "publisher": {
    "@type": "Organization",
    "name": "FreshJuice",
    "logo": {
      "@type": "ImageObject",
      "url": "https://freshjuice.dev/img/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://freshjuice.dev/blog/schema-guide/"
  }
}
```

> **Tip:** The module can auto-populate Article schema from HubSpot content fields like `content.name`, `content.blog_author`, and publish dates.

---

## Product

Describes a product with price, availability, reviews, and other commercial details.

### Use Cases

- Product detail pages
- E-commerce listings
- Software/SaaS product pages
- Any page selling or showcasing a product

### Google Rich Results

**Product Snippets** — displays price, availability, star rating, and review count directly in search results.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "FreshJuice Pro Theme",
  "image": "https://freshjuice.dev/img/theme-preview.jpg",
  "description": "A premium HubSpot CMS theme with 50+ modules, built for performance and conversion.",
  "brand": {
    "@type": "Brand",
    "name": "FreshJuice"
  },
  "sku": "FJ-THEME-PRO",
  "offers": {
    "@type": "Offer",
    "url": "https://freshjuice.dev/pricing/",
    "priceCurrency": "USD",
    "price": "499.00",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2024-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
```

---

## Service

Describes a service offering provided by a business.

### Use Cases

- Services pages
- Professional services listings
- Consulting/agency offerings
- Any page describing services you provide

### Google Rich Results

**Enhanced Listings** — improves how your service pages appear in search with structured service information.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "HubSpot Development",
  "description": "Custom HubSpot CMS development including themes, modules, and integrations.",
  "provider": {
    "@type": "Organization",
    "name": "FreshJuice"
  },
  "serviceType": "Web Development",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "HubSpot Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Custom Theme Development"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Module Development"
        }
      }
    ]
  }
}
```

> **Note:** Service schema does NOT support `priceRange` (only LocalBusiness does per Schema.org specification).

---

## SoftwareApplication

Describes software products, apps, or SaaS offerings.

### Use Cases

- SaaS product pages
- Mobile app landing pages
- Desktop software pages
- Browser extension pages

### Google Rich Results

**App Info in Search** — displays app name, rating, price, and platform information in search results.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "FreshJuice Theme Builder",
  "operatingSystem": "Web",
  "applicationCategory": "BusinessApplication",
  "description": "A visual theme builder for HubSpot CMS that lets you customize your website without code.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "ratingCount": "89"
  },
  "screenshot": "https://freshjuice.dev/img/app-screenshot.png"
}
```

---

## Review / AggregateRating

Displays individual reviews or aggregate rating information.

### Use Cases

- Product pages with customer reviews
- Testimonials pages
- Business review displays
- Any page showcasing ratings/reviews

### Google Rich Results

**Star Ratings** — displays star ratings and review counts in search results, increasing click-through rates.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "FreshJuice Pro Theme",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "127"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "John Smith"
      },
      "datePublished": "2024-01-10",
      "reviewBody": "Excellent theme with great support. Made our HubSpot site look professional in no time.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Sarah Johnson"
      },
      "datePublished": "2024-01-05",
      "reviewBody": "Very flexible and well-documented. The modules save us tons of development time.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      }
    }
  ]
}
```

---

## HowTo

Structures step-by-step instructional content.

### Use Cases

- Tutorial pages
- DIY guides
- Recipe pages
- Setup/installation guides
- Any step-by-step instructions

### Google Rich Results

**How-to Rich Results** — displays steps, images, and estimated time directly in search results. Can appear with expandable steps.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Install a HubSpot Module",
  "description": "Step-by-step guide to installing a module from the HubSpot Marketplace.",
  "totalTime": "PT5M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Browse the Marketplace",
      "text": "Go to the HubSpot Marketplace and find the module you want to install.",
      "image": "https://freshjuice.dev/img/tutorial/step1.jpg"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Click Install",
      "text": "Click the 'Install' button and select the portal where you want to add the module.",
      "image": "https://freshjuice.dev/img/tutorial/step2.jpg"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Add to Page",
      "text": "Open the page editor, find the module in the sidebar, and drag it onto your page.",
      "image": "https://freshjuice.dev/img/tutorial/step3.jpg"
    }
  ]
}
```

---

## VideoObject

Describes video content with metadata for video search.

### Use Cases

- Video landing pages
- Tutorial video pages
- Webinar recordings
- Any page with embedded video content

### Google Rich Results

**Video Carousels** — displays video thumbnails, duration, and descriptions in search results and Google Video search.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Getting Started with FreshJuice Theme",
  "description": "Learn how to set up and customize your FreshJuice HubSpot theme in this comprehensive tutorial.",
  "thumbnailUrl": "https://freshjuice.dev/img/video-thumbnail.jpg",
  "uploadDate": "2024-01-15T09:00:00+00:00",
  "duration": "PT12M30S",
  "contentUrl": "https://freshjuice.dev/videos/getting-started.mp4",
  "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": "https://schema.org/WatchAction",
    "userInteractionCount": 5647
  }
}
```

---

## Event

Describes events like webinars, conferences, workshops, or concerts.

### Use Cases

- Event landing pages
- Webinar registration pages
- Conference pages
- Workshop/training pages
- Concert/show listings

### Google Rich Results

**Event Listings** — displays event date, time, location, and ticket info in search results. Appears in Google Events search.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "HubSpot CMS Masterclass",
  "description": "A comprehensive workshop on building high-performance websites with HubSpot CMS.",
  "startDate": "2024-03-15T10:00:00-07:00",
  "endDate": "2024-03-15T16:00:00-07:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
  "location": [
    {
      "@type": "Place",
      "name": "FreshJuice HQ",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Main Street",
        "addressLocality": "San Francisco",
        "addressRegion": "CA",
        "postalCode": "94102",
        "addressCountry": "US"
      }
    },
    {
      "@type": "VirtualLocation",
      "url": "https://freshjuice.dev/events/masterclass/live"
    }
  ],
  "image": "https://freshjuice.dev/img/masterclass-banner.jpg",
  "offers": {
    "@type": "Offer",
    "url": "https://freshjuice.dev/events/masterclass/",
    "price": "299.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": "2024-01-01T00:00:00-07:00"
  },
  "organizer": {
    "@type": "Organization",
    "name": "FreshJuice",
    "url": "https://freshjuice.dev"
  },
  "performer": {
    "@type": "Person",
    "name": "Alex Zappa"
  }
}
```

> **Tip:** The module supports `MixedEventAttendanceMode` for hybrid events with both in-person and virtual attendance options.

---

## Person

Describes an individual person like team members, authors, or speakers.

### Use Cases

- Team/about pages
- Author bio pages
- Speaker profiles
- Expert/contributor pages

### Google Rich Results

**Author Info** — associates content with verified authors, improving E-E-A-T signals. Can display author information in search results.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Alex Zappa",
  "givenName": "Alex",
  "familyName": "Zappa",
  "jobTitle": "Founder & Lead Developer",
  "url": "https://freshjuice.dev/authors/reatlat/",
  "image": "https://freshjuice.dev/img/authors/alex.jpg",
  "description": "HubSpot CMS developer and founder of FreshJuice, building premium themes and modules for modern marketers.",
  "email": "alex@freshjuice.dev",
  "worksFor": {
    "@type": "Organization",
    "name": "FreshJuice"
  },
  "sameAs": [
    "https://twitter.com/reatlat",
    "https://github.com/reatlat",
    "https://linkedin.com/in/reatlat"
  ]
}
```

---

## JobPosting

Describes job openings for career pages.

### Use Cases

- Individual job listing pages
- Career pages with job openings
- Recruitment landing pages

### Google Rich Results

**Google Jobs** — displays job listings in Google's job search feature with title, salary, location, and application info.

### Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Senior HubSpot Developer",
  "description": "<p>We're looking for an experienced HubSpot developer to join our growing team. You'll be building custom themes, modules, and integrations for our clients.</p><h3>Requirements</h3><ul><li>3+ years HubSpot CMS experience</li><li>Strong HubL and JavaScript skills</li><li>Experience with modern CSS frameworks</li></ul>",
  "datePosted": "2024-01-10",
  "validThrough": "2024-03-10T23:59:59-07:00",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "FreshJuice",
    "sameAs": "https://freshjuice.dev",
    "logo": "https://freshjuice.dev/img/logo.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main Street",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94102",
      "addressCountry": "US"
    }
  },
  "jobLocationType": "TELECOMMUTE",
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 100000,
      "maxValue": 150000,
      "unitText": "YEAR"
    }
  },
  "applicantLocationRequirements": {
    "@type": "Country",
    "name": "United States"
  }
}
```

---

## Testing Resources

Before publishing, always validate your structured data:

<table-saw>

| Tool                         | Description                                    | Link                                                                               |
| ---------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Google Rich Results Test** | Test if your page is eligible for rich results | [search.google.com/test/rich-results](https://search.google.com/test/rich-results) |
| **Schema.org Validator**     | Validate JSON-LD syntax and structure          | [validator.schema.org](https://validator.schema.org/)                              |
| **JSON-LD Playground**       | Debug and visualize JSON-LD markup             | [json-ld.org/playground](https://json-ld.org/playground/)                          |

</table-saw>

### Validation Tips

1. **Test before publishing** — Always run your pages through the Rich Results Test after adding schema
2. **Check for errors** — Fix any critical errors before deploying
3. **Monitor Search Console** — Check the Enhancements reports for ongoing issues
4. **Keep data accurate** — Ensure schema data matches visible page content

---

## Module Settings Reference

### Adding Multiple Schemas

Schema Pro uses a repeater interface — you can add multiple schema types to a single page. Each schema type has its own field prefix:

| Prefix      | Schema Type         |
| ----------- | ------------------- |
| `org__`     | Organization        |
| `site__`    | WebSite             |
| `bread__`   | BreadcrumbList      |
| `faq__`     | FAQPage             |
| `local__`   | LocalBusiness       |
| `article__` | Article             |
| `product__` | Product             |
| `service__` | Service             |
| `app__`     | SoftwareApplication |
| `review__`  | Review/Rating       |
| `howto__`   | HowTo               |
| `video__`   | VideoObject         |
| `event__`   | Event               |
| `person__`  | Person              |
| `job__`     | JobPosting          |

### Smart Defaults

The module automatically uses HubSpot data when available:

- **Article schema** — auto-populates from `content.name`, `content.blog_author`, publish dates
- **BreadcrumbList** — can auto-generate from URL structure
- **Organization** — falls back to `site_settings.company_name`

---

## Learn More

- [Google Structured Data Guide](https://developers.google.com/search/docs/appearance/structured-data)
- [Schema.org Documentation](https://schema.org/)
- [HubSpot Module Development](https://developers.hubspot.com/docs/cms/building-blocks/modules)
