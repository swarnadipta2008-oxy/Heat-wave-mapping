# CHE110 CA1 Submission Kit

## Project title

**Digital Heatwave Risk Mapping for Indian Cities**

This guide supports the handwritten report required for CHE110 Environmental Studies. Write it in your own handwriting and use screenshots from the finished website as attachments. Do not claim that the project issues official heatwave alerts.

## One-minute project explanation

HeatMap India is a digital learning tool that compares heat exposure signals across 25 selected Indian cities. It uses daily maximum and minimum temperature estimates from the ERA5 reanalysis dataset, accessed through Open-Meteo, for 2024 and 2025. The project looks at three signals: the hottest day in a year, the number of days with a maximum temperature of at least 40 degrees Celsius, and the number of nights with a minimum temperature of at least 25 degrees Celsius. These are combined in a transparent, educational heat exposure index. The map is designed to start conversations about heat, urban planning, public-health preparedness, and climate resilience.

## Handwritten report plan

### 1. Introduction

Extreme heat is a serious environmental and public-health challenge. A heatwave can affect health, water supply, electricity demand, outdoor work, transport, and learning. Cities can become hotter than nearby surroundings because roads, buildings, and low tree cover absorb and retain heat; this is often called the urban heat island effect. Heat also matters at night because warm nights reduce the body's opportunity to recover from daytime heat.

This project asks: **How do the intensity, persistence, and nighttime burden of heat differ across selected Indian cities?** The goal is not to replace official warnings. It is to use digital maps and openly explained calculations to make heat patterns easier to explore and discuss.

The project examines 25 selected cities, including a focus on Punjab. It uses two complete calendar years, 2024 and 2025. This is a purposive study sample, so it does not represent every city in India.

### 2. Review of literature

The World Health Organization explains that heat is an environmental and occupational health hazard. Older adults, children, outdoor workers, and people with chronic health conditions can be especially vulnerable. WHO also notes that cities may amplify heat because of urban design, loss of green space, and unsuitable building materials.

The India Meteorological Department (IMD) is the authoritative source for official heatwave alerts in India. IMD heatwave classification involves local thresholds, departure from normal temperature, observations across stations, and persistence. Therefore, a single day at or above 40 degrees Celsius is not automatically an official heatwave declaration.

For this project, daily 2-metre maximum and minimum temperatures are drawn from ERA5 weather reanalysis through Open-Meteo. Reanalysis combines observations with a weather model to provide geographically consistent estimates. It is useful for comparison, but it is not the same as an individual IMD weather-station observation.

### 3. Description of the product

The product is a responsive website called **HeatMap India**. It has four connected sections:

1. **Risk atlas:** An interactive India map displays 25 city markers. Users can search, filter by index tier, focus on Punjab, select a city, and view annual peak temperature, hot days, warm nights, and the city index.
2. **City comparison:** Users select two to four cities and compare their temperature indicators in a table. This prevents a city from being judged only by its hottest temperature.
3. **Scenario lab:** Users adjust a hypothetical peak temperature, number of hot days, and number of warm nights. The index changes immediately so the effect of each indicator is visible.
4. **Research and sources:** This section states the question, data source, formula, limits, heatwave-definition caution, sources, and possible responses.

The website includes 18,275 daily temperature pairs: 25 cities multiplied by 366 days in 2024 and 365 days in 2025. Data completeness was checked before it was added to the site.

### 4. Methodology and formula

For each city-year, the following indicators are calculated:

- **Peak intensity:** highest daily maximum temperature in the year.
- **Hot-day persistence:** number of days when daily maximum temperature is at least 40 degrees Celsius.
- **Nighttime burden:** number of nights when daily minimum temperature is at least 25 degrees Celsius.

The educational HeatMap index is:

```text
T = clamp((peak - 30) / 18, 0, 1)
D = clamp(hot days / 60, 0, 1)
N = clamp(warm nights / 150, 0, 1)
Index = round(45T + 35D + 20N)
```

The project categories are Low (0-39), Moderate (40-59), High (60-74), and Very high (75-100). These categories are project choices, not IMD alert categories. The formula intentionally gives more weight to the annual peak and hot-day persistence, while keeping warm nights visible.

### 5. Results and discussion

In the 2024 dataset, the website found a maximum modeled annual peak of **47.5 degrees Celsius in Bathinda**. Sixteen of the twenty-five study cities had at least one day with a maximum temperature of 40 degrees Celsius or above. The unweighted average HeatMap index across the selected cities was 58 out of 100.

The project shows why one number alone is insufficient. Delhi had a high modeled peak and many hot days, producing a very high educational index. Mumbai can have lower daily maximum temperatures but many warm nights, which makes nighttime heat relevant. Bengaluru had fewer hot days and relatively lower night burden in the selected year. These comparisons show that heat differs by intensity, duration, and the ability to cool down overnight.

The interpretation has limits. This index does not include humidity, local shade, housing quality, work type, access to water or cooling, age, medical conditions, population size, or official warning criteria. It does not estimate deaths, illness, or the number of people at risk. Two years of data cannot demonstrate a climate-change trend. The project is therefore an educational screening and communication tool.

### 6. Significance of the product

The product makes a complicated environmental problem more visible and understandable. It combines maps, data, simple charts, comparison, and a scenario lab. The transparent formula helps a user ask better questions rather than accepting a black-box score. The project encourages students and communities to think about official heat alerts, safe work timing, drinking water, shade, tree cover, cool roofs, emergency readiness, and checking on vulnerable people.

### 7. Social-media coverage status

After publishing, write the genuine results here and attach screenshots. Never invent this section.

```text
Platform: ______________________________
Date posted: ___________________________
Link / QR code: ________________________
Views: ______  Likes: ______  Shares: ______  Comments: ______
What the post taught viewers: __________________________________
Attachment numbers: ____________________________________________
```

### 8. Conclusion

HeatMap India demonstrates how digital technology can support environmental learning and awareness. Using a consistent two-year weather dataset for 25 selected cities, the project shows that urban heat should be discussed through both daytime and nighttime conditions. Its strongest contribution is transparency: users can see the source, inspect the formula, compare cities, and test hypothetical changes. The project should be expanded in future with longer time series, local station data, humidity, land-cover data, population vulnerability indicators, and validation with local authorities. Until then, official IMD bulletins remain essential for real-time heatwave information.

## Attachments to include in the handwritten report

1. Screenshot of the landing page and map.
2. Screenshot of Delhi or your chosen city inspector.
3. Screenshot of a city comparison, ideally Delhi, Mumbai, and Bengaluru.
4. Screenshot of a scenario-lab change.
5. Screenshot of the research-and-sources page.
6. Screenshot or printout of the data provenance file.
7. Social-media post screenshot and genuine engagement evidence after publishing.

## Five-minute awareness-video script

### 0:00-0:35 - Opening

"When we hear that a city is hot, we usually imagine one number: the daytime temperature. But heat has more than one story. It can be intense, it can stay for many days, and it can continue after sunset. Our CHE110 project, HeatMap India, makes those patterns visible."

Show the homepage and map.

### 0:35-1:15 - The problem

"Heat affects health, work, water, electricity, and daily life. Cities can trap heat because of concrete, roads, limited shade, and dense construction. Older adults, children, outdoor workers, and people with health conditions may face greater risk. That is why understanding heat is an environmental issue and a public-health issue."

Show a city map and the safety/response section.

### 1:15-2:05 - The data

"We studied 25 selected Indian cities, including a Punjab focus, across 2024 and 2025. We used daily maximum and minimum temperature estimates from the ERA5 weather reanalysis dataset through Open-Meteo. That gave us 18,275 complete daily temperature pairs. These are gridded model estimates, not individual weather-station observations."

Show the Research & sources page and provenance link.

### 2:05-2:55 - The map and results

"Our map has three main signals: the highest temperature in a year, the number of days at or above 40 degrees Celsius, and the number of nights at or above 25 degrees Celsius. In the 2024 study, Bathinda had the highest modeled peak at 47.5 degrees Celsius. Sixteen of our 25 cities had at least one day at or above 40 degrees Celsius."

Click map markers and show the city inspector.

### 2:55-3:40 - Compare, do not oversimplify

"A higher peak does not tell the entire story. In the comparison page, Delhi, Mumbai, and Bengaluru show different profiles. Delhi has high peak heat and many hot days. Mumbai may have lower maximum temperatures but many warm nights. Warm nights matter because the body gets less opportunity to recover. This is why our map does not treat all heat as the same."

Show comparison page.

### 3:40-4:25 - Transparent scenario lab

"Our score is not a government warning. It is a transparent educational index. We show the formula and let users change a hypothetical value in the scenario lab. For example, reducing the peak by two degrees changes the index, but it does not prove that one intervention will cool a real city by two degrees. It helps us understand sensitivity, not make a forecast."

Show the scenario lab and move one slider.

### 4:25-5:10 - Action and closing

"The most important message is that awareness must lead to action. Follow official IMD warnings. Avoid intense activity during the hottest part of the day. Drink water, look after vulnerable people, and support shade, green space, cool roofs, and safer work schedules. HeatMap India is a student project, but the question is shared by every city: how can we make our communities safer in a warming future?"

End on the research/response page with university acknowledgement visible.

## Bibliography

1. India Meteorological Department. *Heat Wave Guidance*. https://mausam.imd.gov.in/responsive/heatwave_guidance.php (accessed 11 September 2026).
2. India Meteorological Department. *Annexure 5: Heat Wave*. https://internal.imd.gov.in/section/nhac/dynamic/fdpheatreport2019.pdf (accessed 11 September 2026).
3. World Health Organization. *Heat and health*. https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health (accessed 11 September 2026).
4. World Health Organization. *Heatwaves*. https://www.who.int/health-topics/heatwaves/ (accessed 11 September 2026).
5. Open-Meteo. *Historical Weather API*. https://open-meteo.com/en/docs/historical-weather-api (accessed 11 September 2026).
6. Abhinav Swami. *India Official GeoJSON*. https://github.com/AbhinavSwami28/india-official-geojson (accessed 11 September 2026).

## Before submission checklist

- [ ] Read and understand each report section before handwriting it.
- [ ] Write the exact title: Digital Heatwave Risk Mapping for Indian Cities.
- [ ] Add screenshots with short captions and attachment numbers.
- [ ] Keep the official-heatwave limitation in the report and video.
- [ ] Test the map, comparison, scenario, and source sections before recording.
- [ ] Record at least five minutes if submitting a video.
- [ ] Add the university acknowledgement to the video or post.
- [ ] Record real social-media figures only after publishing.
