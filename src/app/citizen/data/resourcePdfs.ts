export interface ResourcePdf {
  title: string;
  subtitle: string;
  sections: { heading: string; body: string }[];
}

export const resourcePdfs: Record<string, ResourcePdf> = {
  "Lifecycle Analysis": {
    title: "Electronics Lifecycle Analysis",
    subtitle: "A comprehensive guide to understanding the full lifecycle of electronic devices",
    sections: [
      {
        heading: "1. Introduction",
        body: "Electronic devices go through multiple stages from raw material extraction to end-of-life disposal. Understanding this lifecycle is critical to reducing environmental impact and promoting a circular economy.",
      },
      {
        heading: "2. Raw Material Extraction",
        body: "Electronics require rare earth metals such as lithium, cobalt, tantalum, and gold. Mining these materials causes habitat destruction, water pollution, and significant CO2 emissions. India alone consumes over 3 million tonnes of raw materials annually for electronics manufacturing.",
      },
      {
        heading: "3. Manufacturing",
        body: "The manufacturing phase involves circuit board fabrication, component assembly, and testing. This stage is energy-intensive and produces chemical waste including solvents and heavy metals. Leading manufacturers are now adopting ISO 14001 environmental management standards.",
      },
      {
        heading: "4. Distribution & Use",
        body: "Products are shipped globally, contributing to carbon emissions. The use phase typically spans 2–7 years depending on device type. Energy-efficient designs can reduce electricity consumption by up to 40% during this phase.",
      },
      {
        heading: "5. End-of-Life & Disposal",
        body: "At end-of-life, electronics should be directed to certified e-waste recyclers. In India, the E-Waste (Management) Rules 2016 mandate Extended Producer Responsibility (EPR), requiring manufacturers to collect and recycle a set percentage of products sold.",
      },
      {
        heading: "6. Circular Economy Opportunities",
        body: "Refurbishment, remanufacturing, and material recovery can recover up to 95% of valuable materials. A circular approach to electronics could reduce lifecycle emissions by up to 70% by 2040.",
      },
    ],
  },

  "Material Recovery": {
    title: "E-Waste Material Recovery Guide",
    subtitle: "Recovering valuable resources from discarded electronic equipment",
    sections: [
      {
        heading: "1. Why Material Recovery Matters",
        body: "Global e-waste contains recoverable materials worth over ₹5,188 billion annually. Recovering these materials reduces the need for virgin mining, lowers carbon emissions, and creates green jobs in the recycling sector.",
      },
      {
        heading: "2. Precious Metals",
        body: "A tonne of mobile phones contains 300g of gold, 3kg of silver, and 130kg of copper — far richer concentrations than ore. Urban mining (recovering metals from e-waste) is now considered vital to India's resource security strategy.",
      },
      {
        heading: "3. Recovery Processes",
        body: "Manual dismantling separates major components. Mechanical shredding breaks down remaining materials. Hydrometallurgical and pyrometallurgical processes then extract metals. Certified facilities in India follow CPCB guidelines to ensure safe processing.",
      },
      {
        heading: "4. Hazardous Materials Handling",
        body: "E-waste contains lead, mercury, cadmium, and brominated flame retardants. These must be safely contained and processed. Open burning or acid baths — common in informal sectors — release toxic fumes and are strictly prohibited under Indian law.",
      },
      {
        heading: "5. Certified Recyclers in India",
        body: "The Central Pollution Control Board (CPCB) maintains a list of authorized e-waste recyclers. As of 2024, over 468 facilities are authorized across India. Always use certified recyclers to ensure safe and legal processing.",
      },
      {
        heading: "6. How You Can Contribute",
        body: "Drop your electronics at authorized collection centers, participate in manufacturer take-back programs, and use platforms like ELocate to find certified facilities near you. Collective action from citizens can dramatically improve India's 17% e-waste recycling rate.",
      },
    ],
  },

  "Reduction Tips": {
    title: "E-Waste Reduction Tips",
    subtitle: "Practical steps to reduce your electronic waste footprint",
    sections: [
      {
        heading: "1. Buy Less, Buy Better",
        body: "Choose quality over quantity. Invest in devices with longer warranties, repairability scores, and modular designs. Brands that offer extended software support help extend device life by 2–3 years.",
      },
      {
        heading: "2. Extend Device Life",
        body: "Use protective cases, avoid overcharging batteries, and keep software updated. A well-maintained smartphone lasts 4–5 years. Replace batteries instead of full devices — a battery swap costs ₹500–₹2000 vs. ₹15,000+ for a new device.",
      },
      {
        heading: "3. Repair Before Replacing",
        body: "India has a thriving repair ecosystem. Local technicians can fix most hardware issues at a fraction of replacement cost. The Right to Repair initiative in India is pushing manufacturers to make spare parts and manuals available.",
      },
      {
        heading: "4. Donate & Resell",
        body: "Functional devices can be donated to schools, NGOs, or resold on platforms like OLX or Cashify. One person's old device is another's first computer. Donating extends the useful life of electronics and bridges the digital divide.",
      },
      {
        heading: "5. Responsible Disposal",
        body: "Never throw electronics in regular trash. Use ELocate or the manufacturer's take-back program to find your nearest certified collection point. Many brands like Dell, Apple, and Samsung run free take-back programs in India.",
      },
      {
        heading: "6. Educate Others",
        body: "Share knowledge about e-waste with friends and family. Workplace e-waste drives can collect hundreds of devices at once. Community awareness is one of the most powerful tools for improving e-waste management.",
      },
    ],
  },

  "E-Waste Policy": {
    title: "E-Waste Policy in India",
    subtitle: "Understanding regulations and your responsibilities under Indian e-waste law",
    sections: [
      {
        heading: "1. E-Waste (Management) Rules, 2016",
        body: "India's primary e-waste regulation, amended in 2018, covers 21 categories of electrical and electronic equipment. It establishes Extended Producer Responsibility (EPR), requiring producers, importers, and brand owners to meet annual collection targets.",
      },
      {
        heading: "2. Extended Producer Responsibility (EPR)",
        body: "Under EPR, manufacturers must collect and channel a defined percentage of the e-waste equivalent to past sales for recycling. EPR targets started at 30% in 2017 and scale to 70% by 2023. Non-compliance attracts substantial financial penalties.",
      },
      {
        heading: "3. Role of the CPCB",
        body: "The Central Pollution Control Board (CPCB) is the nodal authority for e-waste management in India. It authorizes recyclers, maintains the EPR portal, and monitors compliance. State Pollution Control Boards (SPCBs) handle enforcement at state level.",
      },
      {
        heading: "4. Consumer Responsibilities",
        body: "Citizens are legally required to deposit e-waste only at authorized collection points. Illegal dumping of e-waste is punishable under the Environment Protection Act, 1986. Consumers should demand collection facilities from retailers at the point of sale.",
      },
      {
        heading: "5. E-Waste (Management) Amendment Rules, 2022",
        body: "The 2022 amendments introduced a strengthened EPR framework with tradable EPR certificates, stricter auditing, and new categories including solar panels and electric vehicle batteries. These changes aim to bring India's recycling rate to 60% by 2026.",
      },
      {
        heading: "6. Future Outlook",
        body: "India generated 1.6 million tonnes of e-waste in 2023, ranking third globally. With smartphone penetration rising rapidly, volumes will grow significantly. Policy enforcement, citizen participation, and infrastructure investment are key to sustainable e-waste management in India.",
      },
    ],
  },
};
