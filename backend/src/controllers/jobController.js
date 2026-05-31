import fs from 'fs/promises';
import path from 'path';
import { HimalayasService } from '../services/himalayasService.js';

export const JobController = {
  /**
   * GET /api/jobs
   * Retrieves and searches jobs
   */
  async getAllJobs(req, res, next) {
    try {
      const {
        q,
        country,
        worldwide,
        exclude_worldwide,
        seniority,
        employment_type,
        company,
        timezone,
        sort,
        page,
        category
      } = req.query;

      const filters = {
        q,
        country,
        worldwide: worldwide === 'true' ? true : worldwide === 'false' ? false : undefined,
        exclude_worldwide: exclude_worldwide === 'true' ? true : exclude_worldwide === 'false' ? false : undefined,
        seniority,
        employment_type,
        company,
        timezone,
        sort,
        page: page ? parseInt(page) : 1,
        category
      };

      const result = await HimalayasService.getJobs(filters);
      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/jobs/:guid
   * Retrieves a single job by GUID
   */
  async getJobDetails(req, res, next) {
    try {
      const { guid } = req.params;
      const job = await HimalayasService.getJobByGuid(guid);
      
      return res.status(200).json({
        success: true,
        job
      });
    } catch (error) {
      // Map error message
      return res.status(404).json({
        success: false,
        message: error.message || 'Job details not found'
      });
    }
  },

  /**
   * POST /api/jobs/manual
   * Manually creates and saves a job from LinkedIn/other sources to local JSON
   */
  async createManualJob(req, res, next) {
    try {
      const {
        title,
        companyName,
        companyLogo,
        excerpt,
        description,
        employmentType,
        seniority,
        minSalary,
        maxSalary,
        currency,
        locationRestrictions,
        applicationLink
      } = req.body;

      // Schema validation
      if (!title || !companyName || !applicationLink) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: title, companyName, and applicationLink are required.'
        });
      }

      const manualPath = path.join(process.cwd(), 'src/data/manualJobs.json');
      let manualJobs = [];
      try {
        const fileData = await fs.readFile(manualPath, 'utf-8');
        manualJobs = JSON.parse(fileData);
      } catch (err) {
        // Fallback if file isn't created yet or has syntax errors
      }

      // Generate a unique GUID
      const guid = `manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Parse locations: can be comma-separated string or array
      let locations = [];
      if (locationRestrictions) {
        if (Array.isArray(locationRestrictions)) {
          locations = locationRestrictions;
        } else if (typeof locationRestrictions === 'string') {
          locations = locationRestrictions.split(',').map(l => l.trim()).filter(Boolean);
        }
      }

      const newJob = {
        guid,
        title: title.trim(),
        excerpt: excerpt ? excerpt.trim() : (description ? description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : ''),
        description: description ? description.trim() : '',
        companyName: companyName.trim(),
        companyLogo: companyLogo ? companyLogo.trim() : '',
        companySlug: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        employmentType: employmentType || 'Full Time',
        seniority: seniority || 'Mid-level',
        minSalary: minSalary ? parseInt(minSalary) : null,
        maxSalary: maxSalary ? parseInt(maxSalary) : null,
        currency: currency || 'USD',
        locationRestrictions: locations,
        timezoneRestrictions: [],
        pubDate: Date.now(),
        source: 'LinkedIn',
        applicationLink: applicationLink.trim()
      };

      manualJobs.push(newJob);
      await fs.writeFile(manualPath, JSON.stringify(manualJobs, null, 2), 'utf-8');

      return res.status(201).json({
        success: true,
        message: 'Manual job listing posted successfully!',
        job: newJob
      });
    } catch (error) {
      next(error);
    }
  }
};
