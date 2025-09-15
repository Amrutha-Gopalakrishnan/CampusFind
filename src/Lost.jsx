import React, { useState } from 'react'
import Hero from './assets/Hero.png'

export default function ReportLostBelonging() {
  const [formData, setFormData] = useState({
    description: '',
    identity: '',
    phone: '',
    altPhone: '',
    date: '',
    time: '',
    location: '',
    preciseLocation: '',
    status: 'Pending',
    agree: false,
  })

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Report Lost Belonging</h2>
        <p className="text-sm text-gray-600">Provide as much detail as possible for faster recovery.</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        {/* Upload Image */}
        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center justify-center mb-6">
          <div className="w-20 h-20 bg-[#e6f3ef] flex items-center justify-center rounded-lg overflow-hidden">
          <div className="w-20 h-20 bg-[#e6f3ef] flex items-center justify-center rounded-lg">
            <span className="text-[#15735b] font-semibold">Image</span>
          </div>          </div>
          {/* Accessible file input */}
          <input id="fileUploadLost" type="file" className="hidden" />
          <label
            htmlFor="fileUploadLost"
            className="mt-3 px-4 py-2 bg-[#15735b] text-white rounded-md hover:bg-[#125e4b] cursor-pointer"
          >
            Choose File
          </label>
        </div>

        {/* Description */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
          placeholder="Describe the item you lost..."
          rows="3"
        ></textarea>

        {/* Identity */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Any specific Identity / Evidence
        </label>
        <input
          type="text"
          className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#15735b]"
          placeholder="Any unique identifiers or marks on the item..."
        />

        {/* Posted By */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              disabled
              value="Amrutha Varshini"
              className="w-full border rounded-lg p-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              disabled
              value="amrutha@vccollege.ac.in"
              className="w-full border rounded-lg p-2 bg-gray-100"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Primary Phone Number</label>
            <input type="text" className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Alternative Phone Number</label>
            <input type="text" className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]" />
          </div>
        </div>

        {/* When & Where */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input type="date" className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Time</label>
            <input type="time" className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Location</label>
            <input type="text" className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]" />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Precise location details</label>
          <input type="text" className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]" />
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#15735b]">
            <option>Pending</option>
            <option>Found</option>
            <option>Claimed</option>
          </select>
        </div>

        {/* CTA */}
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 border rounded-md">Cancel</button>
          <button className="px-4 py-2 bg-[#15735b] text-white rounded-md hover:bg-[#125e4b]">
            Submit Lost Report
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-[#e6f3ef] border border-[#c8e6dc] rounded-lg p-4 mt-6">
        <h3 className="font-medium text-[#15735b] mb-1">Need Help?</h3>
        <p className="text-sm text-gray-600">
          If you have any questions or need assistance with your lost item report,
          please contact our support team at{' '}
          <a href="mailto:support@belongify.ac.in" className="text-[#15735b] font-medium">
            support@belongify.ac.in
          </a>{' '}
          or visit the Lost & Found office in the Student Services Building.
        </p>
      </div>
    </div>
  )
}


