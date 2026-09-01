"""Backend coverage for: Heatwave trends are clearly demonstration data.

Verifies GET /api/heatmap/trends returns the ten-year 2015-2024 demonstration
series consumed by the temperature/frequency trend charts.
"""


def test_heatmap_trends_returns_ten_year_demo_series(client):
    resp = client.get("/heatmap/trends")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 10, f"expected 10 trend points, got {len(data)}: {data}"

    years = [point["year"] for point in data]
    assert years[0] == "2015" and years[-1] == "2024", f"unexpected year range: {years}"
    assert years == sorted(years), f"years not chronologically ordered: {years}"

    required_fields = {"year", "frequency", "day_temperature", "night_temperature"}
    for point in data:
        assert required_fields.issubset(point.keys()), f"trend point missing fields: {point}"
        assert isinstance(point["frequency"], (int, float))
        assert isinstance(point["day_temperature"], (int, float))
        assert isinstance(point["night_temperature"], (int, float))
