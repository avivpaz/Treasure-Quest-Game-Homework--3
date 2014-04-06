using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.IO;


/// <summary>
/// Summary description for TreasureAjax
/// </summary>
[WebService(Namespace = "http://proj.ruppin.ac.il/bgroup16/mobile/tar3/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]
public class TreasureAjax : System.Web.Services.WebService {

    public TreasureAjax () {

        //Uncomment the following line if using designed components 
        //InitializeComponent(); 
    }


    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    //----------------------------------------------------------------
    // Set a path point
    //----------------------------------------------------------------
    public void setPathPoint(double lat, double lng, string groupName)
    {
        treasureWS.TreasureWS treasure = new treasureWS.TreasureWS();
        treasureWS.Point point = new treasureWS.Point();
        point.Lat = lat;
        point.Lng = lng;
        treasure.setPathPoint(point, groupName);
    }



    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    //------------------------------------------------------
    // Set a Point Of Interst (POI) for a specific group
    //------------------------------------------------------
    public string setPOI(double lat, double lng, string groupName, string name, string description, string imageUrl)
    {
        treasureWS.TreasureWS treasure = new treasureWS.TreasureWS();
        treasureWS.POI poi = new treasureWS.POI();
        poi.P = new treasureWS.Point();
        poi.P.Lat = lat;
        poi.P.Lng = lng;
        poi.Name = name;
        poi.Description = description;
        poi.ImageUrl = imageUrl;
        JavaScriptSerializer js = new JavaScriptSerializer();
        string jsonString = js.Serialize("ok");
        try
        {
            treasure.setPOI(poi, groupName);
            jsonString = js.Serialize("ok");
        }
        catch (Exception ex) {
            jsonString = js.Serialize("error in treasure.setPOI --- " + ex.Message);
        }

        return jsonString;
    }


    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    //------------------------------------------------
    // Get the list of the points along the path 
    //------------------------------------------------
    public string getPathList(string groupName)
    {
        treasureWS.TreasureWS treasure = new treasureWS.TreasureWS();
        treasureWS.Point[] pointArr = treasure.getPathList(groupName);
        JavaScriptSerializer js = new JavaScriptSerializer();
        string jsonString = js.Serialize(pointArr);
        return jsonString;
    }

    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    //------------------------------------------------
    // Get the list of the POI along the path 
    //------------------------------------------------
    public string getPOIList(string groupName)
    {
        treasureWS.TreasureWS treasure = new treasureWS.TreasureWS();
        treasureWS.POI[] poiArr = treasure.getPOIList(groupName);
        JavaScriptSerializer js = new JavaScriptSerializer();
        string jsonString = js.Serialize(poiArr);
        return jsonString;
    }

}

