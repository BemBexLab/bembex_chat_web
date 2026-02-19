import Link from "next/link";
import Image from "next/image";
import { IoArrowBack } from "react-icons/io5";
// import ContactFormTwo from "@/components/sections/ContactFormTwo"; // Uncomment when ready

// --- MOCK DATA (Replace with your actual import later) ---
// import { blogData } from "@/lib/fackData/blogData"; 
const blogData = [
  {
    id: 1,
    title: "Top 5 U.S.A Digital Marketing Agencies in 2026",
    thumb: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    author: { author_name: "Marketing Team" },
    date: "February 2026",
    category: ["SEO", "PPC", "Marketing"],
    content: (
      <div className="space-y-8">
        {/* Introduction */}
        <p className="text-lg leading-relaxed">
          In 2026, digital marketing is no longer a choice, it's a necessity. As businesses compete for visibility in an increasingly crowded online space, choosing the right digital marketing agency can determine the future of your business.
        </p>
        <p className="leading-relaxed">
          From SEO to PPC advertising, social media marketing, and conversion optimization, selecting the best agency is about much more than just getting clicks; it's about creating long-lasting customer relationships and building brand equity.
        </p>
        <p className="leading-relaxed">
          This is why we've crafted this guide to the top digital marketing agencies in the U.S.A for 2026, focusing on the most innovative strategies and measurable results.
        </p>

        {/* Image 2 inside content */}
        <div className="my-8">
          <Image
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop"
            alt="Team discussing strategy"
            width={800}
            height={450}
            className="w-full h-auto rounded-xl shadow-md"
          />
          <p className="text-sm text-gray-500 mt-2 text-center">Strategic planning is key to digital success.</p>
        </div>

        {/* Agencies List */}
        <h2 className="text-2xl font-bold mt-8 mb-4">The Top 5 Digital Marketing Agencies</h2>
        
        {[
          {
            rank: 1,
            name: "Web Founders USA",
            location: "Georgia, USA",
            phone: "+1 470-470-7520",
            desc: "Web Founders USA redefines digital marketing by creating integrated, customer-first strategies that go beyond simple clicks. They prioritize data-driven decisions and user experience.",
            value: "They don't just optimize websites for SEO they optimize experiences, turning visitors into advocates."
          },
          {
            rank: 2,
            name: "Disruptive Advertising",
            location: "Pleasant Grove, UT",
            phone: "(888) 611-8613",
            desc: "Disruptive Advertising is not just an agency; it's a partner in growth. Their approach to paid advertising and conversion rate optimization focuses on maximizing ROI.",
            value: "Their dedication to radical transparency sets them apart. Clients feel empowered with clear insights."
          },
          {
            rank: 3,
            name: "Rock Salt Marketing Cooperative",
            location: "South Jordan, UT",
            phone: "(385) 481-7307",
            desc: "Rock Salt Marketing brings a human-first approach to digital marketing. Their customer-first philosophy, combined with strong SEO and PPC capabilities, helps businesses reach their full potential.",
            value: "Rock Salt doesn't just deliver campaigns, they build lasting relationships."
          },
          {
            rank: 4,
            name: "KlientBoost",
            location: "Costa Mesa, CA",
            phone: "(877) 501-3447",
            desc: "KlientBoost is a creativity-driven agency that thrives on experimentation. They understand that the digital landscape is constantly changing.",
            value: "KlientBoost doesn't just focus on traffic, they focus on conversion maximization."
          },
          {
            rank: 5,
            name: "inBeat Agency",
            location: "New York, NY & Montreal, Canada",
            phone: "(646) 770-3271",
            desc: "inBeat is leading the charge in influencer marketing and user-generated content (UGC). With a deep understanding of social trends and a focus on authenticity.",
            value: "inBeat's use of UGC and creator partnerships gives brands a human touch that advertising alone can't achieve."
          }
        ].map((agency) => (
          <div key={agency.rank} className="border-l-4 border-blue-600 pl-4 py-2 my-6 bg-gray-50 rounded-r-lg">
            <h3 className="text-xl font-bold mb-2">#{agency.rank} {agency.name}</h3>
            <div className="text-sm text-gray-600 mb-2">
              <span className="mr-4">📍 {agency.location}</span>
              <span>📞 {agency.phone}</span>
            </div>
            <p className="mb-2">{agency.desc}</p>
            <p className="italic text-gray-700 font-medium">💡 {agency.value}</p>
          </div>
        ))}

        {/* Image 3 inside content */}
        <div className="my-8">
          <Image
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=450&fit=crop"
            alt="Digital marketing consultation"
            width={800}
            height={450}
            className="w-full h-auto rounded-xl shadow-md"
          />
          <p className="text-sm text-gray-500 mt-2 text-center">Choosing the right partner requires careful consultation.</p>
        </div>

        {/* How to Choose */}
        <h2 className="text-2xl font-bold mt-8 mb-4">How to Choose the Best Agency</h2>
        <p className="leading-relaxed">
          Choosing the right digital marketing agency goes beyond just selecting a company, it's about finding a strategic partner that aligns with your business's long-term goals.
        </p>
        <ul className="list-disc pl-5 space-y-2 my-4">
          <li><strong>Proven Track Record of ROI:</strong> Look for an agency that shows real, measurable success.</li>
          <li><strong>Innovation and Creativity:</strong> Seek out agencies that push boundaries and aren't afraid to try new strategies.</li>
          <li><strong>Data-Driven Decision Making:</strong> The best agencies use data to inform decisions and maximize ROI.</li>
        </ul>

        {/* FAQs */}
        <h2 className="text-2xl font-bold mt-8 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <details className="group bg-gray-50 p-4 rounded-lg">
            <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
              What are the top internet advertising companies in 2026?
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <p className="text-gray-600 mt-2 text-sm">The top internet advertising companies in 2026 focus on creating innovative and data-driven advertising strategies across various platforms.</p>
          </details>
          <details className="group bg-gray-50 p-4 rounded-lg">
            <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
              What makes a company the best digital marketing company?
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <p className="text-gray-600 mt-2 text-sm">The best digital marketing companies prioritize a data-driven approach, focusing on results like traffic growth, conversion optimization, and customer engagement.</p>
          </details>
          <details className="group bg-gray-50 p-4 rounded-lg">
            <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
              How do I find the best digital marketing services agency?
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <p className="text-gray-600 mt-2 text-sm">Consider agencies that offer a range of customized solutions, such as SEO, PPC, social media management, and content creation.</p>
          </details>
        </div>

        {/* Image 4 inside content */}
        <div className="my-8">
          <Image
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop"
            alt="Success celebration"
            width={800}
            height={450}
            className="w-full h-auto rounded-xl shadow-md"
          />
          <p className="text-sm text-gray-500 mt-2 text-center">Success comes from partnership and measurable results.</p>
        </div>

        {/* CTA */}
        <div className="bg-blue-50 p-6 rounded-xl text-center border border-blue-100">
          <h3 className="text-xl font-bold mb-2">Ready to Transform Your Digital Presence?</h3>
          <p className="text-gray-600 mb-4">Partner with one of these top-rated agencies and take your business to the next level in 2026.</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Get Started Today</button>
        </div>
      </div>
    )
  }
];

// --- METADATA (Do NOT import this, just define it) ---
export async function generateMetadata({ params }) {
  const blog = blogData.find((item) => item.id === Number(params?.id || 1));
  return {
    title: blog ? blog.title : "Blog Not Found",
    description: blog ? blog.title : "No blog description available",
  };
}

// --- COMPONENT ---
export default function BlogPost({ params }) {
  const blog = blogData.find((item) => item.id === Number(params?.id || 1));

  if (!blog) {
    return <div className="text-center py-20">Blog not found</div>;
  }

  return (
    <>
      <main className="py-5 md:py-16 px-4 max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:underline font-semibold"
          >
            <IoArrowBack className="text-lg" />
            Back to Blog List
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Left: Main Image */}
          <div className="w-full lg:w-[40%] sticky top-24">
            <img
              src={blog.thumb}
              alt={blog.title}
              className="w-full h-auto rounded-2xl shadow-lg object-cover"
            />
          </div>

          {/* Right: Content */}
          <div className="w-full lg:w-[60%]">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {blog.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-500 border-b border-gray-200 pb-6">
              <span className="font-medium text-gray-900">{blog.author.author_name}</span>
              <span className="h-1 w-1 bg-gray-400 rounded-full" />
              <span>{blog.date}</span>
              <span className="h-1 w-1 bg-gray-400 rounded-full" />
              <span className="flex gap-2">
                {blog.category?.map((cat, i) => (
                  <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-xs">{cat}</span>
                ))}
              </span>
            </div>

            {/* Blog Body */}
            <div className="prose max-w-none text-gray-700">
              {blog.content}
            </div>
          </div>
        </div>
      </main>

      {/* Contact Form Section */}
      <section className="bg-gray-50 py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
          <p className="text-gray-600 mb-8">Contact us to learn more about these agencies.</p>
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">
              {/* Uncomment below when component is ready */}
              {/* <ContactFormTwo /> */}
              Contact Form Component Placeholder
            </p>
          </div>
        </div>
      </section>
    </>
  );
}