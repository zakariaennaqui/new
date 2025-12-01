import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

function AddService() {
  const [docImg, setDocImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("coach");
  const [customSpeciality, setCustomSpeciality] = useState(""); // Nouvelle state pour spécialité personnalisée
  const [isCustomSpeciality, setIsCustomSpeciality] = useState(false); // Toggle pour spécialité personnalisée
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const { backendUrl, aToken } = useContext(AdminContext);

  const resetForm = () => {
    setDocImg(false);
    setName("");
    setEmail("");
    setPassword("");
    setAddress1("");
    setAddress2("");
    setDegree("");
    setAbout("");
    setFees("");
    setSpeciality("coach");
    setCustomSpeciality("");
    setIsCustomSpeciality(false);
  };

  const handleSpecialityChange = (value) => {
    if (value === 'custom') {
      setIsCustomSpeciality(true);
      setSpeciality('');
    } else {
      setIsCustomSpeciality(false);
      setSpeciality(value);
      setCustomSpeciality('');
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (!docImg) {
        return toast.error("image not selected");
      }

      // Utiliser la spécialité personnalisée si elle est définie, sinon utiliser celle sélectionnée
      const finalSpeciality = isCustomSpeciality ? customSpeciality.trim() : speciality;

      if (isCustomSpeciality && !customSpeciality.trim()) {
        return toast.error("Veuillez saisir la spécialité");
      }

      const formData = new FormData();

      formData.append("image", docImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("speciality", finalSpeciality);
      formData.append("degree", degree);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 })
      );

      //
      formData.forEach((value, key) => {
        console.log(`${key} : ${value}`);
      });

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-service",
        formData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        resetForm();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">add service</p>
      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt=""
            />
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            hidden
          />
          <p>
            upload service <br />
            picture
          </p>
        </div>
        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Service provider name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="name"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="border rounded px-3 py-2"
                type="email"
                placeholder="email"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="border rounded px-3 py-2"
                type="password"
                placeholder="password"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>experience</p>
              <select
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                className="border rounded px-3 py-2"
                name=""
                id=""
              >
                <option value="1 year">1 year</option>
                <option value="2 year">2 year</option>
                <option value="3 year">3 year</option>
                <option value="4 year">4 year</option>
                <option value="5 year">5 year</option>
                <option value="6 year">6 year</option>
                <option value="7 year">7 year</option>
                <option value="8 year">8 year</option>
                <option value="9 year">9 year</option>
                <option value="10 year">10 year</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>fees</p>
              <input
                onChange={(e) => setFees(e.target.value)}
                value={fees}
                className="border rounded px-3 py-2"
                type="number"
                placeholder="fees"
                required
              />
            </div>
          </div>
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>speciality</p>
              {!isCustomSpeciality ? (
                <div>
                  <select
                    onChange={(e) => handleSpecialityChange(e.target.value)}
                    value={speciality}
                    className="border rounded px-3 py-2 mb-2"
                    name=""
                    id=""
                  >
                    <option value="teacher">teacher</option>
                    <option value="doctor">doctor</option>
                    <option value="electrician">electrician</option>
                    <option value="lawyer">lawyer</option>
                    <option value="barber">barber</option>
                    <option value="coach">coach</option>
                    <option value="custom">Autre (saisir manuellement)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <input 
                    type="text" 
                    value={customSpeciality} 
                    onChange={(e) => setCustomSpeciality(e.target.value)} 
                    placeholder="Saisissez la spécialité"
                    required 
                    className="border rounded px-3 py-2 mb-2 w-full"
                  />
                  <button 
                    type="button" 
                    onClick={() => {setIsCustomSpeciality(false); setSpeciality('coach'); setCustomSpeciality('')}}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    Choisir dans la liste prédéfinie
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>education</p>
              <input
                onChange={(e) => setDegree(e.target.value)}
                value={degree}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="education"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>address</p>
              <input
                onChange={(e) => setAddress1(e.target.value)}
                value={address1}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="address 1"
                required
              />
              <input
                onChange={(e) => setAddress2(e.target.value)}
                value={address2}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="address 2"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <p className="mt-4 mb-2">about</p>
          <textarea
            onChange={(e) => setAbout(e.target.value)}
            value={about}
            className="w-full px-4 py-2 border rounded"
            placeholder="about"
            rows={5}
            required
          />
        </div>

        <button type="submit" className="bg-primary px-10 py-3 mt-4 text-white rounded-full">
          add service
        </button>
      </div>
    </form>
  );
}

export default AddService;