import fs from 'fs';

const states = [
  { 
    slug: 'himachal-pradesh', 
    name: 'Himachal Pradesh', 
    html: "<p><strong>Are you dreaming of visiting Shimla and Manali to experience the majestic Snow Mountains in Himachal Pradesh?</strong></p>\n<p><strong>Arivo Holidays</strong> has crafted the ultimate itinerary for you to comfortably explore Shimla and Manali and truly enjoy the majestic Snow Mountains. This journey has been planned uniquely and specially for you to ensure a stress-free mountain vacation.</p>\n<p><strong>Scroll down to check out our hand-picked tour packages below and click to book your dream trip! 👇</strong></p>"
  },
  { 
    slug: 'punjab', 
    name: 'Punjab', 
    html: "<p><strong>Are you eager to visit the Golden Temple and experience the incredibly Rich Culture of Punjab?</strong></p>\n<p>Your search ends here! <strong>Arivo Holidays</strong> brings you the perfect itinerary where you can deeply explore the Golden Temple and authentically enjoy the Rich Culture of the region. This cultural travel plan is designed exclusively for you.</p>\n<p><strong>Check out our premium tour packages below and choose your favorite today! 👇</strong></p>"
  },
  { 
    slug: 'jammu-and-kashmir', 
    name: 'Jammu and Kashmir', 
    html: "<p><strong>Are you planning a trip to visit Srinagar and Gulmarg and experience the true Paradise on Earth in Jammu and Kashmir?</strong></p>\n<p>With <strong>Arivo Holidays</strong>, you get a specially designed itinerary that lets you seamlessly explore Srinagar and Gulmarg and enjoy the true Paradise on Earth without any hassle. This unforgettable trip is uniquely curated just for you.</p>\n<p><strong>Scroll below to see our exclusive tour packages and book your dream getaway! 👇</strong></p>"
  },
  { 
    slug: 'delhi', 
    name: 'Delhi NCR', 
    html: "<p><strong>Are you looking to visit the Qutub Minar and the Red Fort and experience exploring centuries of historic Monuments in Delhi NCR?</strong></p>\n<p><strong>Arivo Holidays</strong> has put together the best possible itinerary so you can freely explore the Qutub Minar and the Red Fort and enjoy exploring centuries of historic Monuments. We have planned this heritage trip in a very special and unique way for you.</p>\n<p><strong>Browse our top-rated tour packages below and start planning your journey! 👇</strong></p>"
  },
  { 
    slug: 'uttar-pradesh', 
    name: 'Uttar Pradesh', 
    html: "<p><strong>Are you hoping to visit the iconic Taj Mahal and the spiritual ghats of Varanasi to experience the deep Heritage of Uttar Pradesh?</strong></p>\n<p>Trust <strong>Arivo Holidays</strong> to provide an incredible itinerary where you can discover the iconic Taj Mahal and the spiritual ghats of Varanasi and deeply enjoy the rich Heritage of the state. This package is uniquely planned for your complete peace of mind.</p>\n<p><strong>Scroll down to explore our hand-crafted tour list and book your perfect holiday! 👇</strong></p>"
  },
  { 
    slug: 'ladakh', 
    name: 'Ladakh', 
    html: "<p><strong>Are you seeking an adventure to visit Leh and Pangong Lake and experience exploring the peaceful Monasteries in Ladakh?</strong></p>\n<p><strong>Arivo Holidays</strong> has developed a brilliant itinerary for you, allowing you to beautifully explore Leh and Pangong Lake and enjoy discovering the peaceful Monasteries. This is a very uniquely and specially planned adventure trip just for you.</p>\n<p><strong>Take a look at our fantastic tour packages below and book your ideal trip! 👇</strong></p>"
  },
  { 
    slug: 'uttarakhand', 
    name: 'Uttarakhand', 
    html: "<p><strong>Are you thrilled to visit Nainital and Rishikesh and experience the breathtaking beauty of the Himalayas in Uttarakhand?</strong></p>\n<p>Look no further! <strong>Arivo Holidays</strong> has created a magical itinerary where you can explore Nainital and Rishikesh and completely enjoy the breathtaking beauty of the Himalayas. This is uniquely structured for your maximum comfort.</p>\n<p><strong>Scroll below to check our hand-picked tour list and secure your bookings today! 👇</strong></p>"
  },
  { 
    slug: 'rajasthan', 
    name: 'Rajasthan', 
    html: "<p><strong>Are you ready to visit majestic Forts and experience thrilling Wildlife safaris and vibrant Rajput Culture in Rajasthan?</strong></p>\n<p><strong>Arivo Holidays</strong> offers the most authentic itinerary for you to explore majestic Forts and fully enjoy thrilling Wildlife safaris and vibrant Rajput Culture. Every detail is planned specially and uniquely for your royal enjoyment.</p>\n<p><strong>Find the best tour packages waiting for you below and click to book! 👇</strong></p>"
  },
  { 
    slug: 'madhya-pradesh', 
    name: 'Madhya Pradesh', 
    html: "<p><strong>Are you planning to visit the ancient temples of Khajuraho and Orchha and experience incredible Wildlife safaris in Madhya Pradesh?</strong></p>\n<p>Let <strong>Arivo Holidays</strong> guide you with a perfect itinerary where you can easily explore the ancient temples of Khajuraho and Orchha and enjoy incredible Wildlife safaris. We have designed this trip uniquely for you.</p>\n<p><strong>Scroll down and click on our premium tour packages to book your next adventure! 👇</strong></p>"
  }
];

let mdContent = `# State Page Overviews (Unique Implementations)\n\n`;
mdContent += `Here is the plan for the **9 States**. Just like we did for the cities, I have generated 9 completely UNIQUE HTML paragraphs that use different sentence structures to avoid duplicate content penalties. They strictly follow your formula featuring the top Attractions and Activities associated with each State.\n\n`;

mdContent += `## User Review Required\n\n`;
mdContent += `> [!IMPORTANT]\n`;
mdContent += `> Please review the overviews for the 9 states below. If everything looks good, simply reply with **"Approve"** and I will run a script to update all of them in the database instantly.\n\n`;
mdContent += `---\n\n`;

states.forEach(s => {
  mdContent += `### ${s.name}\n`;
  mdContent += "```html\n";
  mdContent += s.html + "\n";
  mdContent += "```\n\n";
});

const outPath = '/home/rajnish/.gemini/antigravity/brain/854f34e1-6f88-4cd9-a78a-cb6ab15cdb44/implementation_plan.md';
fs.writeFileSync(outPath, mdContent);
console.log('Successfully generated State implementation_plan.md');
