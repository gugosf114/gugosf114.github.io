/**
 * My Baking Creations - JSON-LD Schema Component
 *
 * Injects LocalBusiness structured data into the page head.
 * Optionally adds Product schema for product pages.
 *
 * Usage:
 *   // Basic LocalBusiness only:
 *   MBCSchema.inject();
 *
 *   // With Product schema:
 *   MBCSchema.inject({
 *     product: {
 *       name: "Custom Birthday Cake",
 *       description: "Sculpted 3D birthday cake",
 *       image: "https://mybakingcreations.com/images/gallery/cakes/sculpted/example.jpg",
 *       price: "250.00",
 *       priceCurrency: "USD"
 *     }
 *   });
 */

const MBCSchema = (function() {
    // Core business data
    const businessData = {
        "@context": "https://schema.org",
        "@type": "Bakery",
        "@id": "https://mybakingcreations.com/#organization",
        "name": "My Baking Creations",
        "description": "Family-owned Bay Area bakery specializing in custom cakes, cookies, and cake pops for birthdays, weddings, and corporate events. Trusted by Google, Meta, Salesforce, and Fortune 500 companies since 2012.",
        "url": "https://mybakingcreations.com",
        "telephone": "+1-415-568-8060",
        "email": "info@mybakingcreations.com",
        "logo": "https://mybakingcreations.com/logo_icon.png",
        "image": "https://mybakingcreations.com/logo_icon.png",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "1096 Wildwood Ave",
            "addressLocality": "Daly City",
            "addressRegion": "CA",
            "postalCode": "94015",
            "addressCountry": "US"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 37.6879,
            "longitude": -122.4702
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "09:00",
                "closes": "18:00"
            }
        ],
        "priceRange": "$$",
        "servesCuisine": "Bakery",
        "foundingDate": "2012",
        "founder": {
            "@type": "Person",
            "name": "Yana"
        },
        "areaServed": [
            {
                "@type": "City",
                "name": "San Francisco",
                "containedInPlace": {
                    "@type": "State",
                    "name": "California"
                }
            },
            {
                "@type": "City",
                "name": "Daly City"
            },
            {
                "@type": "City",
                "name": "San Jose"
            },
            {
                "@type": "City",
                "name": "Palo Alto"
            },
            {
                "@type": "City",
                "name": "Mountain View"
            },
            {
                "@type": "City",
                "name": "San Rafael"
            },
            {
                "@type": "Place",
                "name": "Silicon Valley"
            },
            {
                "@type": "Place",
                "name": "San Francisco Bay Area"
            },
            {
                "@type": "Place",
                "name": "Peninsula"
            },
            {
                "@type": "Place",
                "name": "South Bay"
            }
        ],
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5",
            "reviewCount": "150",
            "bestRating": "5",
            "worstRating": "1"
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Custom Baked Goods",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Product",
                        "name": "Custom Cakes",
                        "description": "Sculpted 3D cakes, tiered celebration cakes, and ultra-realistic designs"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Product",
                        "name": "Logo Cookies",
                        "description": "Corporate logo cookies printed with edible ink for business events"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Product",
                        "name": "Cake Pops",
                        "description": "Hand-decorated cake pops in custom colors and themes"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Product",
                        "name": "Cupcakes",
                        "description": "Elegantly decorated cupcakes for celebrations and corporate events"
                    }
                }
            ]
        },
        "sameAs": [
            "https://www.instagram.com/mybakingcreationscompany/",
            "https://www.facebook.com/MyBakingCreationsCompany",
            "https://www.pinterest.com/MyBakingCreations",
            "https://www.yelp.com/biz/my-baking-creations-san-francisco"
        ],
        "paymentAccepted": ["Cash", "Credit Card", "Venmo", "Zelle"],
        "currenciesAccepted": "USD"
    };

    /**
     * Creates Product schema
     * @param {Object} product - Product details
     * @returns {Object} Product schema object
     */
    function createProductSchema(product) {
        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description || "",
            "image": product.image || "https://mybakingcreations.com/logo_icon.png",
            "brand": {
                "@type": "Brand",
                "name": "My Baking Creations"
            },
            "manufacturer": {
                "@id": "https://mybakingcreations.com/#organization"
            },
            "offers": {
                "@type": "Offer",
                "url": window.location.href,
                "priceCurrency": product.priceCurrency || "USD",
                "price": product.price || "",
                "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                "availability": "https://schema.org/InStock",
                "seller": {
                    "@id": "https://mybakingcreations.com/#organization"
                }
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "reviewCount": "150",
                "bestRating": "5"
            }
        };
    }

    /**
     * Creates BreadcrumbList schema
     * @param {Array} items - Array of {name, url} objects
     * @returns {Object} BreadcrumbList schema object
     */
    function createBreadcrumbSchema(items) {
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "item": item.url
            }))
        };
    }

    /**
     * Injects schema script tag into head
     * @param {Object} schema - Schema object to inject
     */
    function injectSchemaTag(schema) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema, null, 2);
        document.head.appendChild(script);
    }

    /**
     * Main inject function
     * @param {Object} options - Optional configuration
     * @param {Object} options.product - Product details for product pages
     * @param {Array} options.breadcrumbs - Breadcrumb items [{name, url}]
     * @param {boolean} options.skipLocalBusiness - Skip injecting LocalBusiness (if already on page)
     */
    function inject(options = {}) {
        // Inject LocalBusiness schema (unless skipped)
        if (!options.skipLocalBusiness) {
            injectSchemaTag(businessData);
        }

        // Inject Product schema if provided
        if (options.product) {
            injectSchemaTag(createProductSchema(options.product));
        }

        // Inject Breadcrumb schema if provided
        if (options.breadcrumbs && options.breadcrumbs.length > 0) {
            injectSchemaTag(createBreadcrumbSchema(options.breadcrumbs));
        }
    }

    /**
     * Get raw business data (for server-side rendering or debugging)
     * @returns {Object} Business schema data
     */
    function getBusinessData() {
        return JSON.parse(JSON.stringify(businessData));
    }

    // Public API
    return {
        inject: inject,
        getBusinessData: getBusinessData,
        createProductSchema: createProductSchema,
        createBreadcrumbSchema: createBreadcrumbSchema
    };
})();

// Auto-export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MBCSchema;
}
