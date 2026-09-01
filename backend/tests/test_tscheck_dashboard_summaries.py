"""Backend coverage for: Dashboard summaries and charts render from API data.

Verifies GET /api/heatmap/cities returns the 25 demo city records with the
seeded Punjab cluster and known scores used by the dashboard KPIs/charts.
"""


def test_heatmap_cities_returns_25_demo_records(client):
    resp = client.get("/heatmap/cities")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 25, f"expected 25 demo cities, got {len(data)}: {data[:2]}"

    by_id = {c["id"]: c for c in data}

    # Punjab-area seed cluster present
    punjab_names = {"Ludhiana", "Amritsar", "Bathinda", "Jalandhar", "Patiala", "Chandigarh"}
    seeded_names = {c["name"] for c in data}
    missing = punjab_names - seeded_names
    assert not missing, f"missing punjab-area seed cities: {missing}"

    # Known scores from briefing seed facts
    delhi = next((c for c in data if c["name"].startswith("Delhi")), None)
    assert delhi is not None and delhi["score"] == 88, f"delhi record: {delhi}"

    bathinda = next((c for c in data if c["name"] == "Bathinda"), None)
    assert bathinda is not None and bathinda["score"] == 78, f"bathinda record: {bathinda}"

    # All records carry demo-data flag and required numeric fields for dashboard KPIs
    required_fields = {"max_temp", "heatwave_days", "pop_exposure", "urbanization", "vegetation_cover", "score", "tier", "is_demo"}
    for city in data:
        assert required_fields.issubset(city.keys()), f"city missing fields: {city}"
        assert city["is_demo"] is True
