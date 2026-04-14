## Overview
This workflow automates the process of searching Airbnb listings based on user queries submitted from the frontend app. It leverages AI to first interpret the user query and search the listing on Airbnb using keywords in the query, connected to Airbnb through MCP protocol.

### Key Features
- Receives search requests via webhook from the frontend
- Uses AI (OpenAI GPT-4o-mini chat model) to interpret and enrich user queries
- Connects to the Airbnb MCP tool for real-time listing data
- Parses and formats results for email delivery
- Sends a detailed, styled email with recommendations to the user
- Price tracking feature allows the users to receive periodic price updates for their search query

---

## Inputs
- `query`: Description of the desired Airbnb stay (location, features, dates, price range, etc.)
- `email`: User's email address (for results delivery)
- `name`: User's name
- `Price Tracking`: Allows users to receive daily, weekly, or monthly updates on the listings

---

## Outputs
- Sends a personalized email with Airbnb listings and recommendations to the user.

---

## References
- Adapted and Developed form: Agents in Action Course (https://traversaal-ai.github.io/agents-in-action/)
