﻿using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using GeoAPI.Geometries;
using IsraelHiking.Common;
using IsraelHiking.DataAccessInterfaces;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;
using NetTopologySuite.Geometries;
using Newtonsoft.Json;

namespace IsraelHiking.DataAccess
{
    public class GraphHopperGateway : IGraphHopperGateway
    {
        private const string BASE_ADDRESS = "http://localhost:8989/";
        private const string GRAPHHOPPER = "GraphHopper";
        private const int HOUR = 60 * 60 * 1000;

        private readonly ILogger _logger;
        private readonly IFileProvider _fileProvider;


        public GraphHopperGateway(ILogger logger, IFileProvider fileProvider)
        {
            _logger = logger;
            _fileProvider = fileProvider;
        }

        public async Task<LineString> GetRouting(RoutingGatewayRequest request)
        {
            using (var httpClient = new HttpClient())
            {
                string vehicle = "foot";
                switch (request.Profile)
                {
                    case ProfileType.Foot:
                        vehicle = "foot";
                        break;
                    case ProfileType.Bike:
                        vehicle = "bike2";
                        break;
                    case ProfileType.Car:
                        vehicle = "car4wd";
                        break;
                }
                var requestAddress = $"{BASE_ADDRESS}route?instructions=false&points_encoded=false&elevation=true&point={request.From}&point={request.To}&vehicle={vehicle}";
                var response = await httpClient.GetAsync(requestAddress);
                var content = await response.Content.ReadAsStringAsync();
                var jsonResponse = JsonConvert.DeserializeObject<JsonGraphHopperResponse>(content);
                if (jsonResponse?.paths == null || !jsonResponse.paths.Any())
                {
                    return new LineString(new Coordinate[0]);
                }
                if (jsonResponse.paths.First().points.coordinates.Count == 1)
                {
                    var jsonCoordinates = jsonResponse.paths.First().points.coordinates.First();
                    var convertedCoordiates = new Coordinate(jsonCoordinates[0], jsonCoordinates[1], jsonCoordinates.Count > 2 ? jsonCoordinates[2] : 0.0);
                    return new LineString(new [] { convertedCoordiates, convertedCoordiates});
                }
                return new LineString(jsonResponse.paths.First().points.coordinates.Select(c => new Coordinate(c[0], c[1], c.Count > 2 ? c[2] : 0.0)).ToArray());
            }
        }

        public async Task Rebuild(MemoryStream osmFileStream, string osmFileName)
        {
            _logger.LogInformation($"Starting creating graph hopper cache based on latest pbf file: {osmFileName}");
            using (var httpClient = new HttpClient())
            {
                httpClient.Timeout = TimeSpan.FromMinutes(30);
                var requestAddress = $"{BASE_ADDRESS}rebuild";
                ByteArrayContent bytes = new ByteArrayContent(osmFileStream.ToArray());
                MultipartFormDataContent multiContent = new MultipartFormDataContent();
                multiContent.Add(bytes, "file", osmFileName);
                await httpClient.PostAsync(requestAddress, multiContent);
            }
            _logger.LogInformation($"Finished creating graph hopper cache based on latest pbf file: {osmFileName}");
        }
    }
}
