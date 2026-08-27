import React from "react";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import PageHero from "@/components/shared/PageHero";

const STORES = [
  {
    name: "Bole Flagship Store",
    address: "Bole Road, Friendship Building, Ground Floor, Addis Ababa",
    phone: "+251 911 000 000",
    hours: "Mon – Sat: 9:00 AM – 8:00 PM · Sun: 10:00 AM – 6:00 PM",
    coords: [9.005, 38.788],
    mapQuery: "Bole+Road+Addis+Ababa",
  },
  {
    name: "Megenagna Branch",
    address: "Megenagna Circle, Dembel City Center, 2nd Floor, Addis Ababa",
    phone: "+251 911 111 111",
    hours: "Mon – Sat: 9:00 AM – 8:00 PM · Sun: Closed",
    coords: [8.998, 38.797],
    mapQuery: "Megenagna+Addis+Ababa",
  },
  {
    name: "Piassa Workshop & Store",
    address: "Piassa, Adwa Street, Near St. George Church, Addis Ababa",
    phone: "+251 911 222 222",
    hours: "Mon – Sat: 8:30 AM – 7:00 PM · Sun: Closed",
    coords: [9.035, 38.746],
    mapQuery: "Piassa+Addis+Ababa",
  },
];

export default function StoreLocations() {
  return (
    <div>
      <PageHero
        eyebrow="Find Us"
        title="Store Locations"
        subtitle="Visit one of our stores across Addis Ababa to try on our handcrafted shoes in person."
      />

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {STORES.map(store => (
            <div key={store.name} className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-soft hover:shadow-soft-lg transition-shadow">
              {/* Map */}
              <div className="h-56 bg-muted">
                <iframe
                  title={store.name}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${store.coords[1]-0.01}%2C${store.coords[0]-0.01}%2C${store.coords[1]+0.01}%2C${store.coords[0]+0.01}&layer=mapnik&marker=${store.coords[0]}%2C${store.coords[1]}`}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
              {/* Info */}
              <div className="p-6">
                <h2 className="font-display text-xl font-bold mb-4">{store.name}</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{store.address}</span>
                  </div>
                  <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                    <Phone size={16} className="text-primary shrink-0" />
                    <span className="text-sm text-muted-foreground">{store.phone}</span>
                  </a>
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{store.hours}</span>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${store.mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 w-full border border-border py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Navigation size={14} /> Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}