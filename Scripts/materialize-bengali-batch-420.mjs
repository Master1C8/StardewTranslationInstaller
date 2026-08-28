import { materializeDirectBatch } from "./lib/materialize-bengali-direct-batch.mjs";

const values = {
  Barn_Name: "গোয়াল", Barn_GeneralName: "গোয়াল", BigBarn_Name: "বড় গোয়াল", BigCoop_Name: "বড় খোঁয়াড়", BigShed_Name: "বড় শেড", Cabin_Name: "কেবিন", Coop_Name: "খোঁয়াড়", Coop_GeneralName: "খোঁয়াড়", DeluxeBarn_Name: "ডিলাক্স গোয়াল", DeluxeCoop_Name: "ডিলাক্স খোঁয়াড়", DesertObelisk_Name: "মরুভূমি ওবেলিস্ক", EarthObelisk_Name: "ভূমি ওবেলিস্ক", FishPond_Name: "মাছের পুকুর", GoldClock_Name: "সোনার ঘড়ি", Greenhouse_Name: "গ্রিনহাউস", IslandObelisk_Name: "দ্বীপ ওবেলিস্ক", JunimoHut_Name: "জুনিমো কুঁড়েঘর", Mill_Name: "কল", Shed_Name: "শেড", Shed_GeneralName: "শেড", ShippingBin_Name: "বিক্রয় বাক্স", Silo_Name: "সাইলো", SlimeHutch_Name: "স্লাইম ঘর", Stable_Name: "আস্তাবল", WaterObelisk_Name: "জল ওবেলিস্ক", Well_Name: "কুয়া", PetBowl_Name: "পোষ্যের বাটি",
};

materializeDirectBatch({ root: process.cwd(), id: "420-remaining-building-names", kind: "long", target: "Strings/Buildings", entries: Object.entries(values).map(([key, translation]) => ({ key, translation })) });
