/* eslint-disable no-console */
/**
 * Advanced example of sending template-based emails with various scenarios
 */

import { LanefulClient, Email } from '../src';

async function sendTemplateEmail(): Promise<void> {
  const client = new LanefulClient(
    'https://custom-endpoint.send.laneful.net',
    'your-auth-token',
    {
      retry: {
        maxRetries: 3,
        baseDelay: 1000,
      },
    }
  );

  // Example 1: User onboarding templates
  await sendOnboardingEmails(client);

  // Example 2: E-commerce templates
  await sendEcommerceEmails(client);

  // Example 3: SaaS application templates
  await sendSaasEmails(client);

  // Example 4: Bulk template emails with personalization
  await sendBulkTemplateEmails(client);
}

async function sendOnboardingEmails(client: LanefulClient): Promise<void> {
  console.log('=== User Onboarding Template Emails ===');

  const newUsers = [
    {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      signupDate: '2024-03-15',
      plan: 'premium',
      activationToken: 'abc123def456',
    },
    {
      email: 'bob@example.com',
      name: 'Bob Smith',
      signupDate: '2024-03-14',
      plan: 'basic',
      activationToken: 'ghi789jkl012',
    },
  ];

  const emails: Email[] = newUsers.map((user) => ({
    from: {
      email: 'welcome@yourapp.com',
      name: 'Your App Welcome Team',
    },
    to: [{ email: user.email, name: user.name }],
    subject: `Welcome to Your App, ${user.name}! 🎉`,
    templateId: 'user-onboarding-v2',
    templateData: {
      // User information
      userName: user.name.split(' ')[0], // First name only
      fullName: user.name,
      userEmail: user.email,
      signupDate: user.signupDate,

      // Plan-specific content
      planName: user.plan,
      planFeatures:
        user.plan === 'premium'
          ? [
              'Advanced Analytics',
              'Priority Support',
              'Custom Integrations',
              'Unlimited Storage',
            ]
          : ['Basic Analytics', 'Standard Support', 'Essential Integrations'],

      // Action items
      activationLink: `https://yourapp.com/activate/${user.activationToken}`,
      gettingStartedLink: 'https://yourapp.com/getting-started',
      supportLink: 'https://yourapp.com/support',

      // Personalization
      welcomeMessage:
        user.plan === 'premium'
          ? 'Thank you for choosing our premium experience!'
          : 'Welcome to our community!',

      // Dynamic content
      tips: [
        'Complete your profile to get personalized recommendations',
        'Explore our tutorial videos in the help section',
        user.plan === 'premium'
          ? 'Schedule a free onboarding call with our success team'
          : 'Join our community forum',
      ],
    },
    tag: 'user-onboarding',
    tracking: {
      opens: true,
      clicks: true,
      unsubscribes: true,
      unsubscribeGroupId: 1,
    },
    webhookData: {
      userId: user.activationToken,
      userPlan: user.plan,
      onboardingStep: 'welcome',
    },
  }));

  try {
    const responses = await client.sendEmails(emails);

    console.log('Onboarding emails results:');
    responses.forEach((response, index) => {
      const user = newUsers[index];
      if (response.success) {
        console.log(
          `✅ Welcome email sent to ${user?.name} (${user?.plan} plan)`
        );
      } else {
        console.log(`❌ Failed to send to ${user?.name}: ${response.error}`);
      }
    });
  } catch (error) {
    console.error('Onboarding emails failed:', error);
  }
}

async function sendEcommerceEmails(client: LanefulClient): Promise<void> {
  console.log('\n=== E-commerce Template Emails ===');

  // Order confirmation with dynamic product data
  const orderConfirmation: Email = {
    from: {
      email: 'orders@yourstore.com',
      name: 'Your Store',
    },
    to: [
      {
        email: 'customer@example.com',
        name: 'Sarah Wilson',
      },
    ],
    subject: 'Order Confirmation #ORD-2024-001 - Thank you for your purchase!',
    templateId: 'ecommerce-order-confirmation',
    templateData: {
      // Customer details
      customerName: 'Sarah',
      customerEmail: 'customer@example.com',

      // Order information
      orderNumber: 'ORD-2024-001',
      orderDate: '2024-03-15',
      orderTotal: '$149.99',
      shippingCost: '$9.99',
      tax: '$12.00',

      // Products
      items: [
        {
          name: 'Wireless Headphones',
          sku: 'WH-001',
          quantity: 1,
          price: '$79.99',
          image: 'https://yourstore.com/images/headphones.jpg',
        },
        {
          name: 'Phone Case',
          sku: 'PC-042',
          quantity: 2,
          price: '$24.99',
          image: 'https://yourstore.com/images/case.jpg',
        },
      ],

      // Shipping
      shippingAddress: {
        name: 'Sarah Wilson',
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        country: 'USA',
      },
      estimatedDelivery: '2024-03-20',
      trackingNumber: 'TRK123456789',
      trackingUrl: 'https://shipping.com/track/TRK123456789',

      // Recommendations
      recommendedProducts: [
        {
          name: 'Wireless Charger',
          price: '$29.99',
          url: 'https://yourstore.com/charger',
        },
        {
          name: 'Screen Protector',
          price: '$14.99',
          url: 'https://yourstore.com/protector',
        },
      ],

      // URLs
      orderDetailsUrl: 'https://yourstore.com/orders/ORD-2024-001',
      supportUrl: 'https://yourstore.com/support',
    },
    tag: 'order-confirmation',
    tracking: {
      opens: true,
      clicks: true,
      unsubscribes: false, // Transactional
    },
  };

  // Abandoned cart recovery
  const cartRecovery: Email = {
    from: {
      email: 'shop@yourstore.com',
      name: 'Your Store',
    },
    to: [
      {
        email: 'shopper@example.com',
        name: 'Mike Chen',
      },
    ],
    subject: "Don't forget your items! Complete your purchase and save 10%",
    templateId: 'abandoned-cart-recovery',
    templateData: {
      customerName: 'Mike',
      cartItems: [
        {
          name: 'Gaming Mouse',
          price: '$59.99',
          image: 'https://yourstore.com/images/mouse.jpg',
          url: 'https://yourstore.com/products/gaming-mouse',
        },
        {
          name: 'Mechanical Keyboard',
          price: '$129.99',
          image: 'https://yourstore.com/images/keyboard.jpg',
          url: 'https://yourstore.com/products/mechanical-keyboard',
        },
      ],
      cartTotal: '$189.98',
      discountCode: 'SAVE10',
      discountAmount: '10%',
      cartUrl: 'https://yourstore.com/cart/resume/abc123',
      expiresAt: '2024-03-18',

      // Social proof
      reviews: [
        { product: 'Gaming Mouse', rating: 5, text: 'Perfect for gaming!' },
        {
          product: 'Mechanical Keyboard',
          rating: 5,
          text: 'Amazing build quality!',
        },
      ],
    },
    tag: 'cart-recovery',
    tracking: {
      opens: true,
      clicks: true,
      unsubscribes: true,
      unsubscribeGroupId: 2,
    },
  };

  try {
    const emails = [orderConfirmation, cartRecovery];
    const responses = await client.sendEmails(emails);

    const emailTypes = ['Order Confirmation', 'Cart Recovery'];
    console.log('E-commerce emails results:');
    responses.forEach((response, index) => {
      if (response.success) {
        console.log(`✅ ${emailTypes[index]} sent successfully`);
      } else {
        console.log(`❌ ${emailTypes[index]} failed: ${response.error}`);
      }
    });
  } catch (error) {
    console.error('E-commerce emails failed:', error);
  }
}

async function sendSaasEmails(client: LanefulClient): Promise<void> {
  console.log('\n=== SaaS Application Template Emails ===');

  // Trial expiration warning
  const trialWarning: Email = {
    from: {
      email: 'billing@yoursaas.com',
      name: 'Your SaaS Billing',
    },
    to: [
      {
        email: 'trial-user@example.com',
        name: 'Lisa Rodriguez',
      },
    ],
    subject: 'Your trial expires in 3 days - Choose your plan',
    templateId: 'trial-expiration-warning',
    templateData: {
      userName: 'Lisa',
      trialExpiresDate: '2024-03-18',
      daysRemaining: 3,
      currentUsage: {
        projectsUsed: 5,
        projectsLimit: 10,
        storageUsed: '2.3 GB',
        storageLimit: '5 GB',
        apiCallsUsed: 1250,
        apiCallsLimit: 5000,
      },
      plans: [
        {
          name: 'Starter',
          price: '$29/month',
          features: ['10 projects', '10 GB storage', '25K API calls'],
          recommended: false,
          upgradeUrl: 'https://yoursaas.com/upgrade/starter',
        },
        {
          name: 'Professional',
          price: '$79/month',
          features: [
            '50 projects',
            '100 GB storage',
            '100K API calls',
            'Priority support',
          ],
          recommended: true,
          upgradeUrl: 'https://yoursaas.com/upgrade/professional',
        },
        {
          name: 'Enterprise',
          price: '$199/month',
          features: [
            'Unlimited projects',
            '1 TB storage',
            'Unlimited API calls',
            'Dedicated support',
          ],
          recommended: false,
          upgradeUrl: 'https://yoursaas.com/upgrade/enterprise',
        },
      ],
      faqUrl: 'https://yoursaas.com/pricing-faq',
      contactUrl: 'https://yoursaas.com/contact-sales',
    },
    tag: 'trial-expiration',
    tracking: {
      opens: true,
      clicks: true,
      unsubscribes: true,
      unsubscribeGroupId: 3,
    },
  };

  // Feature announcement
  const featureAnnouncement: Email = {
    from: {
      email: 'product@yoursaas.com',
      name: 'Your SaaS Product Team',
    },
    to: [
      {
        email: 'customer@example.com',
        name: 'David Park',
      },
    ],
    subject: '🚀 New Feature: Advanced Analytics Dashboard',
    templateId: 'feature-announcement',
    templateData: {
      customerName: 'David',
      featureName: 'Advanced Analytics Dashboard',
      releaseDate: '2024-03-15',

      // Feature details
      benefits: [
        'Real-time performance metrics',
        'Custom report generation',
        'Data export in multiple formats',
        'Advanced filtering and segmentation',
      ],

      // Media
      featureImage: 'https://yoursaas.com/images/analytics-dashboard.png',
      demoVideoUrl: 'https://yoursaas.com/videos/analytics-demo',
      documentationUrl: 'https://docs.yoursaas.com/analytics',

      // Getting started
      ctaText: 'Try Analytics Now',
      ctaUrl: 'https://yoursaas.com/dashboard/analytics',
      tutorialUrl: 'https://yoursaas.com/tutorials/analytics',

      // Additional info
      availablePlans: ['Professional', 'Enterprise'],
      customerPlan: 'Professional',
      upgradeRequired: false,
    },
    tag: 'feature-announcement',
    tracking: {
      opens: true,
      clicks: true,
      unsubscribes: true,
      unsubscribeGroupId: 4,
    },
  };

  try {
    const emails = [trialWarning, featureAnnouncement];
    const responses = await client.sendEmails(emails);

    const emailTypes = ['Trial Warning', 'Feature Announcement'];
    console.log('SaaS emails results:');
    responses.forEach((response, index) => {
      if (response.success) {
        console.log(`✅ ${emailTypes[index]} sent successfully`);
      } else {
        console.log(`❌ ${emailTypes[index]} failed: ${response.error}`);
      }
    });
  } catch (error) {
    console.error('SaaS emails failed:', error);
  }
}

async function sendBulkTemplateEmails(client: LanefulClient): Promise<void> {
  console.log('\n=== Bulk Template Emails with Personalization ===');

  const subscribers = [
    {
      email: 'subscriber1@example.com',
      name: 'Emma Thompson',
      preferences: {
        topics: ['technology', 'productivity'],
        frequency: 'weekly',
      },
      location: 'San Francisco, CA',
      joinDate: '2023-01-15',
      engagement: 'high',
    },
    {
      email: 'subscriber2@example.com',
      name: 'James Miller',
      preferences: { topics: ['business', 'finance'], frequency: 'monthly' },
      location: 'New York, NY',
      joinDate: '2023-06-20',
      engagement: 'medium',
    },
    {
      email: 'subscriber3@example.com',
      name: 'Maria Garcia',
      preferences: { topics: ['design', 'creativity'], frequency: 'weekly' },
      location: 'Austin, TX',
      joinDate: '2024-01-10',
      engagement: 'high',
    },
  ];

  const emails: Email[] = subscribers.map((subscriber) => ({
    from: {
      email: 'newsletter@yourblog.com',
      name: 'Your Blog Newsletter',
    },
    to: [{ email: subscriber.email, name: subscriber.name }],
    subject: `Your Personalized Weekly Digest - ${subscriber.name}`,
    templateId: 'personalized-newsletter',
    templateData: {
      // Subscriber info
      subscriberName: subscriber.name.split(' ')[0],
      fullName: subscriber.name,
      location: subscriber.location,
      memberSince: subscriber.joinDate,
      engagementLevel: subscriber.engagement,

      // Personalized content based on preferences
      topics: subscriber.preferences.topics,
      articles: subscriber.preferences.topics.map((topic) => ({
        title: `Latest in ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
        summary: `Discover the newest trends and insights in ${topic}...`,
        url: `https://yourblog.com/category/${topic}`,
        readTime: '5 min read',
        author: 'Expert Team',
        publishedDate: '2024-03-15',
      })),

      // Dynamic recommendations
      recommendedArticles: [
        {
          title: 'How to Stay Productive While Working Remotely',
          url: 'https://yourblog.com/remote-productivity',
          category: 'productivity',
        },
        {
          title: 'The Future of Technology in 2024',
          url: 'https://yourblog.com/tech-2024',
          category: 'technology',
        },
      ],

      // Personalized stats
      stats: {
        articlesRead:
          subscriber.engagement === 'high'
            ? 15
            : subscriber.engagement === 'medium'
              ? 8
              : 3,
        timeSpentReading:
          subscriber.engagement === 'high'
            ? '2h 30m'
            : subscriber.engagement === 'medium'
              ? '1h 15m'
              : '30m',
        favoriteCategory: subscriber.preferences.topics[0],
      },

      // Subscription management
      frequency: subscriber.preferences.frequency,
      preferencesUrl: `https://yourblog.com/preferences/${subscriber.email}`,
      unsubscribeUrl: `https://yourblog.com/unsubscribe/${subscriber.email}`,

      // Social links
      socialLinks: {
        twitter: 'https://twitter.com/yourblog',
        linkedin: 'https://linkedin.com/company/yourblog',
        facebook: 'https://facebook.com/yourblog',
      },
    },
    tag: 'personalized-newsletter',
    tracking: {
      opens: true,
      clicks: true,
      unsubscribes: true,
      unsubscribeGroupId: 5,
    },
    webhookData: {
      subscriberId: subscriber.email,
      engagement: subscriber.engagement,
      topics: subscriber.preferences.topics.join(','),
    },
  }));

  try {
    const responses = await client.sendEmails(emails);

    console.log('Bulk template emails results:');
    responses.forEach((response, index) => {
      const subscriber = subscribers[index];
      if (response.success) {
        console.log(
          `✅ Newsletter sent to ${subscriber?.name} (${subscriber?.engagement} engagement)`
        );
      } else {
        console.log(
          `❌ Failed to send to ${subscriber?.name}: ${response.error}`
        );
      }
    });

    const successful = responses.filter((r) => r.success).length;
    console.log(
      `\nSummary: ${successful}/${responses.length} personalized newsletters sent`
    );
  } catch (error) {
    console.error('Bulk template emails failed:', error);
  }
}

// Run the example
sendTemplateEmail();
