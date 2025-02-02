import React, { useState, useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, FeatureGroup, Marker } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AxiosInstance from '../axiosInstance'
import {CustomerDetail} from '../components/customerDetail'



/*
export function AddMap() {
  const [center, setCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [MapLayers, setMapLayers] = useState([]);
  const mapRef = useRef();
  const navigate = useNavigate();
  const [users, setUsers] = useState(null)
  const [customers, setCustomers] = useState([]);
  const [polygonId, setPolygonId] = useState(-1)
  const ZOOM_LEVEL = localStorage.getItem("AddzoomLevel") || 12;

  useEffect(() => {
    const handleZoomChanged = () => {
      // Your code to run when the zoom level changes
      const map = mapRef.current;
      if (map) {
        const zoomLevel = map.getZoom();
        localStorage.setItem("AddzoomLevel", zoomLevel);
          localStorage.setItem(`ZoomLevelPolygon${polygonId}`, zoomLevel);
      }
    };
    // Assuming mapRef.current is your reference to the map object
    const map = mapRef.current;
    // Check if the map object is available
    if (map) {
      // Add an event listener for the zoomChanged event
      map.on('zoomend', handleZoomChanged);
      // Clean up the event listener when the component is unmounted
      return () => {
        map.off('zoomend', handleZoomChanged);
      };
    }
  }, [mapRef, polygonId]); // Include mapRef and polygonId in the dependency array


  // Function to handle 'beforeunload' event
  const handleBeforeUnload = () => {
    const map = mapRef.current;
    if (map) {
      const zoomLevel = map.getZoom();
      localStorage.setItem("AddzoomLevel", zoomLevel);
    }
  };
  // Add 'beforeunload' event listener when the component mounts
  useEffect(() => {
    const unloadListener = (event) => {
      handleBeforeUnload();
      // The following line is necessary for older browsers
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", unloadListener);
    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", unloadListener);
    };
  }, []);


  useEffect(() => {
    async function getUsers() {
      try {
        const response = await AxiosInstance.get('api/customer/getAllCustomerLocation/')
        setUsers(response.data.data)
      } catch (error) {
        console.log(error)
      }
    }
    getUsers()
  }, [])

  const [searchValue, setSearchValue] = useState("");
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSelect = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchValue}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

// Using map ref to manually change the position in map 
  useEffect(() => {
    // Manually set the center of the map when the center state changes using useref
    if (mapRef.current && center) {
      mapRef.current.setView([center.lat, center.lng], ZOOM_LEVEL);
    }
  }, [center]);



  //for creating removing and editing handlers
  const _onCreate = (e) => {
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const { _leaflet_id } = layer;
      setMapLayers((layers) => [
        ...layers,

        { leaflet_id: _leaflet_id, latlngs: layer._latlngs[0] },
      ]);
    }
  };

  const onEdited = (layers) => {
    //polygons that are changed are stored in changedPolys array
    const changedPolys = Object.values(layers._layers).map((layer) => {
      const latlngs = layer._latlngs[0].map((latlng) => {
        return { lat: latlng.lat, lng: latlng.lng };
      });
      return { leaflet_id: layers._layers._leaflet_id, latlngs: latlngs };
    });

    //update state of all the polygons. replace polygons with changedPolys
    changedPolys.forEach((changedPoly) => {
      setMapLayers((polygons) => {
        return polygons.map((polygon) => {
          if (polygon.leaflet_id === changedPoly.leaflet_id) {
            return { id: changedPoly.leaflet_id, latlngs: changedPoly.latlngs };
          }
          return polygon;
        });
      });
    });
  };

  const _onDeleted = (e) => {
    const {
      layers: { _layers },
    } = e;

    Object.values(_layers).map(({ _leaflet_id }) => {
      setMapLayers((layers) =>
        layers.filter((l) => l.leaflet_id !== _leaflet_id)
      );
    });
  };

  //on adding polygon

  const handleClick = async () => {
    if (MapLayers.length == 0) {
      alert("create atleast one polygon");
      return;
    }
    try {
      const response = await AxiosInstance.post(
        "api/map/addPolygon/",
        MapLayers
      );
      if (response.data.data) {
        setCustomers(response.data.data);
      }
      if (response.data.polygonId) {
        setPolygonId(response.data.polygonId)
      }
      alert(response.data.msg);

      const map = mapRef.current;
      const zoomLevel = map.getZoom()
      localStorage.setItem(`ZoomLevelPolygon${response.data.polygonId}`, zoomLevel);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <MapContainer
        center={center}
        zoom={ZOOM_LEVEL}
        style={{ height: "500px", width: "100%" }}
        ref={mapRef}
      >
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={_onCreate}
            onEdited={(e) => {
              onEdited(e.layers);
            }}
            onDeleted={_onDeleted}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
            }}
          />
        </FeatureGroup>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {users && users.map((user) => {
          return (
            <Marker key={user[0]} position={user}>
            </Marker>
          )
        })
        }
      </MapContainer>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          backgroundColor: "#242424",
          paddingTop: "50px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex" }}>
          <Form>
            <Form.Control
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search Location"
            />
          </Form>
          <button type="button" onClick={handleSelect}>
            Search Location
          </button>
        </div>
        <Button variant="outline-primary" onClick={handleClick}>
          Save Data(Polygon)
        </Button>
        <Button
          style={{ marginLeft: "20px" }}
          variant="outline-secondary"
          onClick={() => {
            navigate("/");
          }}
        >
          Go Home
        </Button>
      </div>

      {customers.length > 0 && (
        <CustomerDetail customers={customers} />
)}
    </>
  );
}
*/

export function ServiceAreaInterface(){
return(
  <div>hello</div>
)
}