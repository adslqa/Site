﻿using System.Collections.Generic;
using IsraelHiking.Common;
using NetTopologySuite.Features;

namespace IsraelHiking.API.Services
{
    /// <summary>
    /// This class facilatates for search factor and icon for geojson features used for search
    /// </summary>
    public interface ITagsHelper
    {
        /// <summary>
        /// Get data according to attributes
        /// </summary>
        /// <param name="attributesTable"></param>
        /// <returns>The search factor, icon, color and category</returns>
        (double SearchFactor, IconColorCategory IconColorCategory) GetInfo(IAttributesTable attributesTable);

        /// <summary>
        /// Find relevant tags for an icon
        /// </summary>
        /// <param name="icon">The icon</param>
        /// <returns>A list of relevant tags</returns>
        List<KeyValuePair<string, string>> FindTagsForIcon(string icon);
    }
}